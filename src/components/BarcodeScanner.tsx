import { useRef, useEffect, useState } from 'react';
import { Camera, X, Loader2, Flashlight, FlashlightOff, ZoomIn, ZoomOut, ScanLine } from 'lucide-react';

interface BarcodeScannerProps {
    showScanner: boolean;
    scannerReady: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    onError: (error: string) => void;
}

export default function BarcodeScanner({ 
    showScanner, 
    scannerReady, 
    onClose, 
    onScan,
    onError 
}: BarcodeScannerProps) {
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrCodeRef = useRef<any>(null);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [zoomSupported, setZoomSupported] = useState(false);
    const videoTrackRef = useRef<MediaStreamTrack | null>(null);
    const [isFocusing, setIsFocusing] = useState(true);

    useEffect(() => {
        if (!showScanner) return;

        const initScanner = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!scannerRef.current) throw new Error('Scanner container not found');

                const { Html5Qrcode } = await import('html5-qrcode');
                html5QrCodeRef.current = new Html5Qrcode("barcode-scanner");

                // 1. CRITICAL FIX: Use High Resolution (4K) constraints
                // This allows scanning small barcodes from 15cm away without getting blurry
                const config = {
                    fps: 30,
                    qrbox: { width: 250, height: 150 }, // Slightly taller box
                    aspectRatio: 1.777778,
                    disableFlip: false,
                    formatsToSupport: [ 8, 9, 12, 13, 5, 4, 0, 1, 2, 3, 6, 7, 10, 11 ],
                    videoConstraints: {
                        facingMode: "environment",
                        // Request 4K or 2K. Browser will provide max available.
                        width: { ideal: 3840, min: 1920 }, 
                        height: { ideal: 2160, min: 1080 },
                        focusMode: "continuous", // Basic focus request
                        advanced: [
                            { focusMode: "continuous" },
                            { exposureMode: "continuous" },
                            { whiteBalanceMode: "continuous" }
                        ]
                    }
                };

                await html5QrCodeRef.current.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText: string) => {
                        // Success
                        if (navigator.vibrate) navigator.vibrate(200);
                        onScan(decodedText);
                    },
                    () => { } // Error/Wait callback
                );

                // 2. Post-Start Configurations (Focus & Zoom)
                setTimeout(async () => {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ 
                            video: { facingMode: "environment" } 
                        });
                        videoTrackRef.current = stream.getVideoTracks()[0];
                        const capabilities = videoTrackRef.current.getCapabilities();

                        // CHECK SUPPORT
                        if ('torch' in capabilities) setTorchSupported(true);
                        if ('zoom' in capabilities) setZoomSupported(true);

                        // 3. AUTO ZOOM FIX
                        // If zoom is supported, immediately zoom to 1.5x or 2.0x
                        // This prevents the user from moving phone too close physically
                        if ('zoom' in capabilities && capabilities.zoom) {
                            const zoomCapability = capabilities.zoom as any;
                            const minZoom = zoomCapability.min || 1;
                            const maxZoom = zoomCapability.max || 1;
                            
                            // Safe start zoom (usually 2.0 is the "Macro" sweet spot on phones)
                            const startZoom = Math.min(Math.max(2.0, minZoom), maxZoom);
                            
                            setZoomLevel(startZoom);
                            await applyConstraintsWithRetry({ zoom: startZoom });
                        }

                        // 4. FORCE FOCUS
                        // Apply aggressive focus constraints
                        await applyConstraintsWithRetry({ 
                            focusMode: "continuous",
                            focusDistance: 0.1 // Try to suggest close focus, but don't break it
                        });

                        setIsFocusing(false);

                    } catch (err) {
                        console.warn('Post-init setup failed:', err);
                        setIsFocusing(false);
                    }
                }, 500);

            } catch (err: any) {
                onError(`Unable to start scanner: ${err.message}`);
            }
        };

        initScanner();

        return () => {
            // Cleanup Logic
            const cleanup = async () => {
                if (videoTrackRef.current) {
                    videoTrackRef.current.stop();
                    videoTrackRef.current = null;
                }
                if (html5QrCodeRef.current?.getState() === 2) {
                    await html5QrCodeRef.current.stop();
                    html5QrCodeRef.current.clear();
                }
            };
            cleanup();
        };
    }, [showScanner]);

    // Helper to apply constraints safely
    const applyConstraintsWithRetry = async (constraints: any) => {
        if (!videoTrackRef.current) return;
        try {
            await videoTrackRef.current.applyConstraints({
                advanced: [constraints]
            });
        } catch (e) {
            console.log("Constraint not supported:", constraints);
        }
    };

    const toggleTorch = async () => {
        const newTorchState = !torchEnabled;
        await applyConstraintsWithRetry({ torch: newTorchState });
        setTorchEnabled(newTorchState);
    };

    const handleZoom = async (delta: number) => {
        if (!videoTrackRef.current) return;
        const capabilities = videoTrackRef.current.getCapabilities();
        // @ts-ignore
        const max = capabilities.zoom?.max || 4;
        // @ts-ignore
        const min = capabilities.zoom?.min || 1;

        const newZoom = Math.min(Math.max(zoomLevel + delta, min), max);
        
        setIsFocusing(true);
        setZoomLevel(newZoom);
        await applyConstraintsWithRetry({ zoom: newZoom });
        
        setTimeout(() => setIsFocusing(false), 500);
    };

    // Manual re-focus trigger
    const triggerFocus = async () => {
        setIsFocusing(true);
        // Toggle focus mode to trigger hardware re-focus
        await applyConstraintsWithRetry({ focusMode: "auto" });
        setTimeout(async () => {
            await applyConstraintsWithRetry({ focusMode: "continuous" });
            setIsFocusing(false);
        }, 800);
    };

    if (!showScanner) return null;

    return (
        <div className="scanner-overlay">
            <div className="scanner-container">
                <div className="scanner-header">
                    <div>
                        <h3 className="scanner-title">
                            <Camera className="btn-icon" /> Scan Barcode
                        </h3>
                        <p className="scanner-subtitle">
                           Keep phone <b>15cm</b> away. Do not get too close.
                        </p>
                    </div>
                    <button onClick={onClose} className="scanner-close-btn">
                        <X className="btn-icon" />
                    </button>
                </div>
                
                <div className="scanner-body">
                    {/* Click the viewport to force re-focus */}
                    <div 
                        id="barcode-scanner" 
                        ref={scannerRef} 
                        className="scanner-viewport" 
                        onClick={triggerFocus}
                    />
                    
                    {!scannerReady && (
                        <div className="scanner-loading">
                            <Loader2 className="animate-spin" size={48} color="#10b981" />
                        </div>
                    )}
                    
                    {/* Static Scan Line for visual guide */}
                    {scannerReady && <div className="scan-line-guide" />}

                    {isFocusing && scannerReady && (
                        <div className="focusing-indicator">Focusing...</div>
                    )}
                    
                    {scannerReady && (
                        <div className="scanner-controls">
                            {torchSupported && (
                                <button 
                                    onClick={toggleTorch}
                                    className={`control-btn ${torchEnabled ? 'torch-active' : ''}`}
                                >
                                    {torchEnabled ? <Flashlight className="btn-icon" /> : <FlashlightOff className="btn-icon" />}
                                </button>
                            )}
                            
                            {zoomSupported && (
                                <div className="zoom-controls">
                                    <button onClick={() => handleZoom(-0.5)} className="control-btn"><ZoomOut className="btn-icon" /></button>
                                    <span className="zoom-level">{zoomLevel.toFixed(1)}x</span>
                                    <button onClick={() => handleZoom(0.5)} className="control-btn"><ZoomIn className="btn-icon" /></button>
                                </div>
                            )}

                             {/* Focus Button if Zoom not supported */}
                             {!zoomSupported && (
                                <button onClick={triggerFocus} className="control-btn" title="Tap to focus">
                                    <ScanLine className="btn-icon" />
                                </button>
                             )}
                        </div>
                    )}
                </div>
                
                <div className="scanner-footer">
                   <p className="scanner-footer-text">
                        Too blurry? Move back and use Zoom (+).
                   </p>
                </div>
            </div>

            <style>{`
                .scanner-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .scanner-container {
                    width: 100%; max-width: 500px; background: #1f2937;
                    border-radius: 1rem; overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
                }
                .scanner-header {
                    padding: 1.5rem; background: #111827; display: flex; justify-content: space-between;
                }
                .scanner-title { display: flex; align-items: center; gap: 0.5rem; color: white; margin: 0; font-size: 1.25rem; font-weight: 600; }
                .scanner-subtitle { margin: 0.25rem 0 0 0; color: #9ca3af; font-size: 0.875rem; }
                .scanner-close-btn { background: #374151; border: none; padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; color: white; }
                
                .scanner-body { position: relative; background: black; min-height: 400px; }
                .scanner-viewport { width: 100%; height: 400px; overflow: hidden; border-radius: 0; cursor: pointer; }
                /* Hide the video element's own object-fit to ensure we control it via library */
                .scanner-viewport video { object-fit: cover; }
                
                .scanner-loading {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                }
                
                .scan-line-guide {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 80%; height: 2px; background: rgba(255,0,0,0.5);
                    box-shadow: 0 0 4px red; pointer-events: none;
                }
                
                .focusing-indicator {
                    position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
                    background: rgba(0,0,0,0.6); color: #10b981; padding: 4px 12px;
                    border-radius: 12px; font-size: 0.8rem; font-weight: 600;
                    pointer-events: none;
                }

                .scanner-controls {
                    position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
                    display: flex; gap: 1rem; align-items: center;
                    background: rgba(0,0,0,0.6); padding: 10px; border-radius: 30px;
                    backdrop-filter: blur(4px);
                }
                .control-btn {
                    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 50%; width: 44px; height: 44px; display: flex;
                    align-items: center; justify-content: center; color: white; cursor: pointer;
                }
                .torch-active { background: rgba(251, 191, 36, 0.3); border-color: #f59e0b; color: #f59e0b; }
                .zoom-controls { display: flex; align-items: center; gap: 8px; }
                .zoom-level { color: white; font-weight: bold; font-size: 0.9rem; min-width: 35px; text-align: center; }
                
                .scanner-footer { padding: 1rem; background: #111827; text-align: center; }
                .scanner-footer-text { color: #9ca3af; font-size: 0.875rem; margin: 0; }
                .btn-icon { width: 20px; height: 20px; }
            `}</style>
        </div>
    );
}