import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, X, Flashlight, FlashlightOff, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

interface ZXingScannerProps {
    showScanner: boolean;
    scannerReady: boolean;
    onClose: () => void;
    onScan: (text: string) => void;
    onError: (error: string) => void;
}

export default function ZXingScanner({ showScanner, scannerReady, onClose, onScan, onError }: ZXingScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [torch, setTorch] = useState(false);
    const [zoom, setZoom] = useState(1);

    const codeReader = useRef<BrowserMultiFormatReader | null>(null);
    const track = useRef<MediaStreamTrack | null>(null);
    const [torchSupport, setTorchSupport] = useState(false);
    const [zoomSupport, setZoomSupport] = useState(false);

    useEffect(() => {
        if (!showScanner) return;

        codeReader.current = new BrowserMultiFormatReader();

        codeReader.current.decodeFromVideoDevice(
            undefined,
            videoRef.current!,
            (result) => {
                if (result) onScan(result.getText());
            }
        )
        .then(() => {
            const videoElement = videoRef.current;
            if (videoElement?.srcObject instanceof MediaStream) {
                track.current = videoElement.srcObject.getVideoTracks()[0];
                const caps = track.current?.getCapabilities() as any;
                if (caps?.torch) setTorchSupport(true);
                if (caps?.zoom) setZoomSupport(true);
            }
        })
        .catch(err => onError(err.message));

        return () => {
            track.current?.stop();
        };

    }, [showScanner, onScan, onError]);

    // ------ TORCH ------
    const toggleTorch = async () => {
        if (!track.current) return;

        const newValue = !torch;
        await track.current.applyConstraints({ advanced: [{ torch: newValue }] as any });
        setTorch(newValue);
    };

    // ------ ZOOM ------
    const applyZoom = async (value: number) => {
        if (!track.current) return;

        setZoom(value);
        await track.current.applyConstraints({ advanced: [{ zoom: value }] as any });
    };

    if (!showScanner) return null;

    return (
        <div style={overlay as React.CSSProperties}>
            <div style={box as React.CSSProperties}>
                {/* HEADER */}
                <div style={header as React.CSSProperties}>
                    <h3 style={{ color: "white", display: "flex", gap: 8, alignItems: "center" }}>
                        <Camera /> Scan Barcode
                    </h3>
                    <button onClick={onClose} style={closeBtn as React.CSSProperties}>
                        <X />
                    </button>
                </div>

                {/* VIDEO */}
                <video ref={videoRef} style={video as React.CSSProperties} autoPlay playsInline />

                {!scannerReady && <Loader2 className="animate-spin" style={loader as React.CSSProperties} />}

                {/* CONTROLS */}
                <div style={controls as React.CSSProperties}>

                    {torchSupport && (
                        <button style={btn as React.CSSProperties} onClick={toggleTorch}>
                            {torch ? <Flashlight /> : <FlashlightOff />}
                        </button>
                    )}

                    {zoomSupport && (
                        <>
                            <button style={btn as React.CSSProperties} onClick={() => applyZoom(Math.max(zoom - 0.5, 1))}>
                                <ZoomOut />
                            </button>

                            <span style={{ color: "white" }}>{zoom.toFixed(1)}x</span>

                            <button style={btn as React.CSSProperties} onClick={() => applyZoom(Math.min(zoom + 0.5, 4))}>
                                <ZoomIn />
                            </button>
                        </>
                    )}
                </div>

                <p style={foot as React.CSSProperties}>Supported: EAN-13 • UPC • QR • Code-128</p>
            </div>
        </div>
    );
}


/************  INLINE STYLES (KEEP SAME UI LOOK) ************/

const overlay: React.CSSProperties = {
    position: "fixed", 
    inset: 0, 
    background:"rgba(0, 0, 0, 0.8)",
    display:"flex", 
    alignItems:"center", 
    justifyContent:"center", 
    zIndex:9999
};

const box: React.CSSProperties = {
    width:"95%", 
    maxWidth:500, 
    background:"#111", 
    padding:15,
    borderRadius:12, 
    position:"relative"
};

const header: React.CSSProperties = {
    display:"flex", 
    justifyContent:"space-between", 
    alignItems:"center"
};

const closeBtn: React.CSSProperties = {
    background:"#333", 
    color:"white", 
    border:"none",
    padding:8, 
    borderRadius:6, 
    cursor:"pointer"
};

const video: React.CSSProperties = { 
    width:"100%", 
    borderRadius:8, 
    background:"black" 
};

const controls: React.CSSProperties = {
    display:"flex", 
    gap:12, 
    justifyContent:"center",
    marginTop:12, 
    background:"#222", 
    padding:10, 
    borderRadius:30
};

const btn: React.CSSProperties = {
    background:"#333", 
    border:"1px solid #444", 
    color:"white",
    padding:10, 
    borderRadius:"50%", 
    cursor:"pointer"
};

const foot: React.CSSProperties = {
    color:"#bbb", 
    fontSize:13, 
    textAlign:"center", 
    marginTop:10
};

const loader: React.CSSProperties = {
    color:"lime", 
    fontSize:40, 
    position:"absolute", 
    top:"45%", 
    left:"45%"
};