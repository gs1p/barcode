import { useState } from 'react';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import BarcodeScanner from './components/BarcodeScanner';
import ProductCard from './components/ProductCard';
import ErrorAlert from './components/ErrorAlert';
import NoResults from './components/NoResults';
import { searchGTIN } from './services/api';

function App() {
    const [gtin, setGtin] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [scannerReady, setScannerReady] = useState(false);

    const startScanner = () => {
        setScannerError(null);
        setScannerReady(false);
        setShowScanner(true);
    };

    const stopScanner = () => {
        setShowScanner(false);
        setScannerReady(false);
    };

    const handleBarcodeScanned = (scannedData: string) => {
        const cleaned = scannedData.replace(/\D/g, '').slice(0, 14);
        if (cleaned.length > 0) {
            const paddedCode = cleaned.padStart(14, '0');
            setGtin(paddedCode);
            stopScanner();

            setTimeout(() => {
                handleSearch(paddedCode);
            }, 300);
        }
    };

    const handleScannerError = (errorMessage: string) => {
        setScannerError(errorMessage);
        setShowScanner(false);
    };

    const handleSearch = async (gtinValue: string = gtin) => {
        const paddedGtin = gtinValue.padStart(14, '0');

        if (paddedGtin.length !== 14) {
            setError('Please enter a valid GTIN (up to 14 digits)');
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            console.log('Searching for GTIN:', paddedGtin);
            const result = await searchGTIN(paddedGtin);
            console.log('API Response:', result);
            setData(result);
        } catch (err: any) {
            console.error('Search Error:', err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="container">
            <Header />
            
            <div className="w-full overflow-hidden">
                <img 
                    src="/top-image.png" 
                    alt="Top Image" 
                    style={{ objectFit: 'contain', width: '100%' }}
                />
            </div>

            <div className="wrapper">
                <SearchInput
                    gtin={gtin}
                    setGtin={setGtin}
                    loading={loading}
                    onSubmit={handleSubmit}
                    onStartScanner={startScanner}
                />

                <BarcodeScanner
                    showScanner={showScanner}
                    scannerReady={scannerReady}
                    onClose={stopScanner}
                    onScan={handleBarcodeScanned}
                    onError={handleScannerError}
                />

                {scannerError && (
                    <ErrorAlert
                        title="Scanner Error"
                        message={scannerError}
                        hint="Please ensure camera permissions are granted and you're using HTTPS"
                    />
                )}

                {error && (
                    <ErrorAlert
                        title="Error"
                        message={error}
                    />
                )}

                {data && data.length > 0 && (
                    <div className="product-list">
                        {data.map((item: any, index: number) => (
                            <ProductCard 
                                key={index} 
                                item={item} 
                                formatDate={formatDate} 
                            />
                        ))}
                    </div>
                )}

                {data && data.length === 0 && <NoResults gtin={gtin} />}
            </div>
        </div>
    );
}

export default App;