import { useRef, useEffect, useState } from 'react';
import { Camera, X, Loader2, Flashlight, FlashlightOff, ZoomIn, ZoomOut } from 'lucide-react';
import Quagga from '@ericblade/quagga2';

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

                // Quagga2 configuration
                Quagga.init({
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: scannerRef.current,
                        constraints: {
                            facingMode: "environment",
                            width: { ideal: 1920, min: 1280 },
                            height: { ideal: 1080, min: 720 },
                            frameRate: { ideal: 30, min: 20 },
                            aspectRatio: 1.777778,
                            advanced: [
                                { focusMode: "continuous" },
                                { focusDistance: { ideal: 0.1, min: 0.05, max: 0.5 } },
                                { exposureMode: "continuous" },
                                { whiteBalanceMode: "continuous" },
                                { brightness: { ideal: 1.1 } },
                                { contrast: { ideal: 1.2 } },
                                { sharpness: { ideal: 1.4 } },
                                { saturation: { ideal: 0.9 } },
                                { zoom: zoomLevel }
                            ] as any
                        }
                    },
                    locator: {
                        patchSize: "medium",
                        halfSample: true
                    },
                    numOfWorkers: 4,
                    frequency: 10,
                    decoder: {
                        readers: [
                            "ean_reader",      // EAN-13, EAN-8 (PRIORITY)
                            "ean_8_reader",    // EAN-8 specific
                            "upc_reader",      // UPC-A
                            "upc_e_reader",    // UPC-E
                            "code_128_reader", // Code 128
                            "code_39_reader",  // Code 39
                            "code_39_vin_reader",
                            "codabar_reader",
                            "i2of5_reader",
                            "2of5_reader",
                            "code_93_reader"
                        ],
                        multiple: false
                    },
                    locate: true
                }, (err) => {
                    if (err) {
                        console.error('Quagga initialization error:', err);
                        onError(`Unable to start scanner: ${err.message || err}`);
                        return;
                    }
                    
                    console.log("Quagga initialization finished. Ready to start");
                    Quagga.start();
                    
                    // Get video track for torch/zoom control
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
                            
                            // Simulate initial focus delay
                            setIsFocusing(true);
                            setTimeout(() => {
                                setIsFocusing(false);
                            }, 1500);
                            
                            // Check torch and zoom support
                            checkTorchSupport();
                            checkZoomSupport();
                        } catch (err) {
                            console.error('Error getting video track:', err);
                            setIsFocusing(false);
                        }
                    }, 1000);
                });

                // Handle detected barcodes
                Quagga.onDetected((result) => {
                    if (result && result.codeResult && result.codeResult.code) {
                        const code = result.codeResult.code;
                        console.log('Scanned:', code);
                        
                        // Vibrate on successful scan
                        if (navigator.vibrate) {
                            navigator.vibrate(200);
                        }
                        
                        onScan(code);
                    }
                });

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
                    
                    Quagga.stop();
                    Quagga.offDetected();
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
            const newZoom = Math.min(zoomLevel + 0.5, 4);
            setZoomLevel(newZoom);
            applyZoom(newZoom);
        }
    };

    const handleZoomOut = () => {
        if (zoomLevel > 1) {
            const newZoom = Math.max(zoomLevel - 0.5, 1);
            setZoomLevel(newZoom);
            applyZoom(newZoom);
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
                        📱 Optimized for: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39
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
                    position: relative;
                }

                .scanner-viewport video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover;
                }

                .scanner-viewport canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100% !important;
                    height: 100% !important;
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