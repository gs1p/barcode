import { useRef, useEffect, useState } from 'react';
import { Camera, X, Loader2, Flashlight, FlashlightOff, ZoomIn, ZoomOut } from 'lucide-react';

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

                if (!scannerRef.current) {
                    throw new Error('Scanner container not found');
                }

                const { Html5Qrcode } = await import('html5-qrcode');
                html5QrCodeRef.current = new Html5Qrcode("barcode-scanner");

                // Enhanced configuration with all features
                const config = {
                    fps: 30, // Higher frame rate for faster scanning
                    qrbox: { width: 250, height: 120 }, // Smaller box for small barcodes
                    aspectRatio: 1.777778,
                    disableFlip: false,
                    // EAN-13 and EAN-8 priority, then others
                    formatsToSupport: [
                        8,  // EAN_13 (PRIORITY)
                        9,  // EAN_8 (PRIORITY)
                        12, // UPC_A
                        13, // UPC_E
                        5,  // CODE_128
                        4,  // CODE_39
                        0,  // QR_CODE
                        1,  // AZTEC
                        2,  // CODABAR
                        3,  // CODE_93
                        6,  // DATA_MATRIX
                        7,  // ITF
                        10, // PDF_417
                        11  // RSS_14
                    ],
                    // Advanced video constraints for close-up scanning
                    videoConstraints: {
                        facingMode: "environment",
                        width: { ideal: 1920, min: 1280 }, // Full HD resolution
                        height: { ideal: 1080, min: 720 }, // 1080p preferred
                        frameRate: { ideal: 30, min: 20 }, // Higher frame rate
                        aspectRatio: 1.777778,
                        advanced: [
                            { focusMode: "continuous" }, // Continuous autofocus
                            { focusDistance: { ideal: 0.1, min: 0.05, max: 0.5 } }, // 5cm-50cm focus range
                            { exposureMode: "continuous" }, // Auto exposure
                            { exposureCompensation: 0 }, // Balanced exposure
                            { whiteBalanceMode: "continuous" }, // Auto white balance
                            { brightness: { ideal: 1.1 } }, // Slight brightness boost
                            { contrast: { ideal: 1.2 } }, // Enhanced contrast for barcode lines
                            { sharpness: { ideal: 1.4 } }, // Higher sharpness for small text
                            { saturation: { ideal: 0.9 } }, // Slightly reduced saturation
                            { zoom: zoomLevel } // Zoom support
                        ]
                    }
                };

                await html5QrCodeRef.current.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText: string) => {
                        console.log('Scanned:', decodedText);
                        // Vibrate on successful scan (if supported)
                        if (navigator.vibrate) {
                            navigator.vibrate(200);
                        }
                        onScan(decodedText);
                    },
                    () => { }
                );

                // Get video track reference for torch control
                setTimeout(async () => {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ 
                            video: { facingMode: "environment" } 
                        });
                        videoTrackRef.current = stream.getVideoTracks()[0];
                        
                        // Enable advanced focus settings
                        await videoTrackRef.current.applyConstraints({
                            advanced: [
                                { focusMode: "continuous" },
                                { focusDistance: 0.1 }
                            ] as any
                        });
                        
                        // Simulate initial focus delay (like other apps)
                        setIsFocusing(true);
                        setTimeout(() => {
                            setIsFocusing(false);
                        }, 1500);
                        
                        // Check torch (flash) support
                        checkTorchSupport();
                        
                        // Check zoom support
                        checkZoomSupport();
                    } catch (err) {
                        console.error('Error getting video track:', err);
                        setIsFocusing(false);
                    }
                }, 1000);

            } catch (err: any) {
                console.error('Scanner error:', err);
                onError(`Unable to start scanner: ${err.message}`);
            }
        };

        initScanner();

        return () => {
            const cleanup = async () => {
                try {
                    // Turn off torch before cleanup
                    if (torchEnabled && videoTrackRef.current) {
                        await videoTrackRef.current.applyConstraints({
                            advanced: [{ torch: false } as any]
                        });
                    }
                    
                    if (videoTrackRef.current) {
                        videoTrackRef.current.stop();
                        videoTrackRef.current = null;
                    }
                    
                    if (html5QrCodeRef.current) {
                        const isScanning = html5QrCodeRef.current.getState() === 2;
                        if (isScanning) {
                            await html5QrCodeRef.current.stop();
                        }
                        html5QrCodeRef.current.clear();
                        html5QrCodeRef.current = null;
                    }
                } catch (err) {
                    console.error('Error stopping scanner:', err);
                }
            };
            cleanup();
        };
    }, [showScanner, onScan, onError]);

    const checkTorchSupport = async () => {
        try {
            if (!videoTrackRef.current) return;
            
            const capabilities = videoTrackRef.current.getCapabilities();
            
            if ('torch' in capabilities) {
                setTorchSupported(true);
                console.log('Torch supported!');
            } else {
                console.log('Torch not supported on this device');
            }
        } catch (err) {
            console.log('Error checking torch support:', err);
        }
    };

    const checkZoomSupport = async () => {
        try {
            if (!videoTrackRef.current) return;
            
            const capabilities = videoTrackRef.current.getCapabilities();
            
            if ('zoom' in capabilities) {
                setZoomSupported(true);
                console.log('Zoom supported!');
            } else {
                console.log('Zoom not supported on this device');
            }
        } catch (err) {
            console.log('Error checking zoom support:', err);
        }
    };

    const toggleTorch = async () => {
        try {
            if (!videoTrackRef.current) {
                console.error('No video track available');
                return;
            }
            
            const newTorchState = !torchEnabled;
            
            await videoTrackRef.current.applyConstraints({
                advanced: [{ torch: newTorchState } as any]
            });
            
            setTorchEnabled(newTorchState);
            console.log(`Torch ${newTorchState ? 'ON' : 'OFF'}`);
        } catch (err) {
            console.error('Error toggling torch:', err);
            onError('Unable to control flash. Please check camera permissions.');
        }
    };

    const handleZoomIn = () => {
        if (zoomLevel < 4) {
            setZoomLevel(prev => Math.min(prev + 0.5, 4));
            applyZoom(Math.min(zoomLevel + 0.5, 4));
        }
    };

    const handleZoomOut = () => {
        if (zoomLevel > 1) {
            setZoomLevel(prev => Math.max(prev - 0.5, 1));
            applyZoom(Math.max(zoomLevel - 0.5, 1));
        }
    };

    const applyZoom = async (zoom: number) => {
        try {
            if (!videoTrackRef.current) return;
            
            // Show focusing indicator during zoom
            setIsFocusing(true);
            
            await videoTrackRef.current.applyConstraints({
                advanced: [
                    { zoom },
                    { focusMode: "continuous" },
                    { focusDistance: 0.1 }
                ] as any
            });
            
            console.log(`Zoom set to ${zoom}x`);
            
            // Clear focusing after camera adjusts
            setTimeout(() => {
                setIsFocusing(false);
            }, 800);
        } catch (err) {
            console.error('Error applying zoom:', err);
            setIsFocusing(false);
        }
    };

    if (!showScanner) return null;

    return (
        <div className="scanner-overlay">
            <div className="scanner-container">
                <div className="scanner-header">
                    <div>
                        <h3 className="scanner-title">
                            <Camera className="btn-icon" />
                            Scan Barcode
                        </h3>
                        <p className="scanner-subtitle">
                            {scannerReady ? 'Position barcode 5-15cm from camera for best results' : 'Starting camera...'}
                        </p>
                    </div>
                    <button onClick={onClose} className="scanner-close-btn">
                        <X className="btn-icon" />
                    </button>
                </div>
                
                <div className="scanner-body">
                    <div id="barcode-scanner" ref={scannerRef} className="scanner-viewport" />
                    {!scannerReady && (
                        <div className="scanner-loading">
                            <Loader2 className="animate-spin" style={{ width: '3rem', height: '3rem', color: '#10b981' }} />
                        </div>
                    )}
                    
                    {/* Focusing Overlay */}
                    {isFocusing && scannerReady && (
                        <div className="focusing-overlay">
                            <div className="focus-ring"></div>
                            <p className="focus-text">Focusing...</p>
                        </div>
                    )}
                    
                    {/* Camera Controls */}
                    {scannerReady && (
                        <div className="scanner-controls">
                            {/* Torch Control */}
                            {torchSupported && (
                                <button 
                                    onClick={toggleTorch}
                                    className={`control-btn ${torchEnabled ? 'torch-active' : ''}`}
                                    title={torchEnabled ? "Turn off flash" : "Turn on flash"}
                                >
                                    {torchEnabled ? (
                                        <Flashlight className="btn-icon" />
                                    ) : (
                                        <FlashlightOff className="btn-icon" />
                                    )}
                                </button>
                            )}
                            
                            {/* Zoom Controls */}
                            {zoomSupported && (
                                <div className="zoom-controls">
                                    <button 
                                        onClick={handleZoomOut}
                                        disabled={zoomLevel <= 1}
                                        className="control-btn"
                                        title="Zoom out"
                                    >
                                        <ZoomOut className="btn-icon" />
                                    </button>
                                    <span className="zoom-level">{zoomLevel.toFixed(1)}x</span>
                                    <button 
                                        onClick={handleZoomIn}
                                        disabled={zoomLevel >= 4}
                                        className="control-btn"
                                        title="Zoom in"
                                    >
                                        <ZoomIn className="btn-icon" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="scanner-footer">
                    <p className="scanner-footer-text">
                        📱 Optimized for: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, QR
                    </p>
                    <p className="scanner-footer-text" style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.8 }}>
                        💡 Tips: Good lighting • Hold steady • 5-15cm distance • Small barcodes? Zoom in!
                    </p>
                </div>
            </div>

            <style>{`
                .scanner-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .scanner-container {
                    width: 100%;
                    max-width: 500px;
                    background: #1f2937;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                }

                .scanner-header {
                    padding: 1.5rem;
                    background: #111827;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .scanner-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: white;
                    margin: 0;
                }

                .scanner-subtitle {
                    margin: 0.5rem 0 0 0;
                    color: #9ca3af;
                    font-size: 0.875rem;
                }

                .scanner-close-btn {
                    background: #374151;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.5rem;
                    cursor: pointer;
                    color: white;
                    transition: background 0.2s;
                }

                .scanner-close-btn:hover {
                    background: #4b5563;
                }

                .scanner-body {
                    position: relative;
                    background: black;
                    min-height: 400px;
                }

                .scanner-viewport {
                    width: 100%;
                    height: 400px;
                }

                .scanner-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .focusing-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    pointer-events: none;
                    animation: fadeIn 0.3s ease-in;
                }

                .focus-ring {
                    width: 100px;
                    height: 100px;
                    border: 3px solid #10b981;
                    border-radius: 50%;
                    border-top-color: transparent;
                    animation: spin 1s linear infinite;
                }

                .focus-text {
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                    margin: 0;
                }

                .scanner-controls {
                    position: absolute;
                    bottom: 1rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 0.75rem;
                    border-radius: 2rem;
                    backdrop-filter: blur(10px);
                }

                .control-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    padding: 0.75rem;
                    cursor: pointer;
                    color: white;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .control-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                .control-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .torch-active {
                    background: rgba(251, 191, 36, 0.3) !important;
                    border-color: rgba(251, 191, 36, 0.5) !important;
                    box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
                }

                .torch-active:hover {
                    background: rgba(251, 191, 36, 0.4) !important;
                }

                .zoom-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .zoom-level {
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    min-width: 3rem;
                    text-align: center;
                }

                .scanner-footer {
                    padding: 1rem 1.5rem;
                    background: #111827;
                    border-top: 1px solid #374151;
                }

                .scanner-footer-text {
                    margin: 0;
                    color: #9ca3af;
                    font-size: 0.875rem;
                    text-align: center;
                }

                .btn-icon {
                    width: 1.25rem;
                    height: 1.25rem;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}