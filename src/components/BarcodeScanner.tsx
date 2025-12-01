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
                            { focusDistance: { ideal: 0.05, min: 0.05, max: 0.3 } }, // 5cm-30cm focus range
                            { exposureMode: "continuous" }, // Auto exposure
                            { exposureCompensation: 0 }, // Balanced exposure
                            { whiteBalanceMode: "continuous" }, // Auto white balance
                            { brightness: { ideal: 1.2 } }, // Slight brightness boost
                            { contrast: { ideal: 1.3 } }, // Enhanced contrast for barcode lines
                            { sharpness: { ideal: 1.5 } }, // Higher sharpness for small text
                            { saturation: { ideal: 0.8 } }, // Reduced saturation for better contrast
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

                // Check torch (flash) support
                checkTorchSupport();
                
                // Check zoom support
                checkZoomSupport();

            } catch (err: any) {
                console.error('Scanner error:', err);
                onError(`Unable to start scanner: ${err.message}`);
            }
        };

        initScanner();

        return () => {
            const cleanup = async () => {
                try {
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
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            
            if ('torch' in capabilities) {
                setTorchSupported(true);
            }
            
            track.stop();
        } catch (err) {
            console.log('Torch not supported');
        }
    };

    const checkZoomSupport = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            
            if ('zoom' in capabilities) {
                setZoomSupported(true);
            }
            
            track.stop();
        } catch (err) {
            console.log('Zoom not supported');
        }
    };

    const toggleTorch = async () => {
        try {
            if (!html5QrCodeRef.current) return;
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            const track = stream.getVideoTracks()[0];
            
            await track.applyConstraints({
                advanced: [{ torch: !torchEnabled } as any]
            });
            
            setTorchEnabled(!torchEnabled);
        } catch (err) {
            console.error('Error toggling torch:', err);
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
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            const track = stream.getVideoTracks()[0];
            
            await track.applyConstraints({
                advanced: [{ zoom } as any]
            });
        } catch (err) {
            console.error('Error applying zoom:', err);
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
                    
                    {/* Camera Controls */}
                    {scannerReady && (
                        <div className="scanner-controls">
                            {/* Torch Control */}
                            {torchSupported && (
                                <button 
                                    onClick={toggleTorch}
                                    className="control-btn"
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

                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}