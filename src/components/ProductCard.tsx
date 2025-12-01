import { useState } from "react";
import ProductDetails from "./ProductDetails";
import CompanyDetails from "./CompanyDetails";

interface ProductCardProps {
    item: any;
    formatDate: (dateString?: string) => string;
}

export default function ProductCard({ item, formatDate }: ProductCardProps) {
    const [activeTab, setActiveTab] = useState<'product' | 'company'>('product');

    return (
        <div>
            {item.gs1Licence && (
                <div className="gs1-banner">
                    <img 
                        src="/gs1tick.png" 
                        alt="GS1 Tick" 
                        className="gs1-img"
                    />
                    <p className="gs1-text">
                        This number is registered to <strong>{item.gs1Licence.licenseeName}</strong>.
                    </p>
                </div>
            )}

            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'product' ? 'active' : ''}`}
                        onClick={() => setActiveTab('product')}
                    >
                        Product information
                    </button>
                    <button
                        className={`tab ${activeTab === 'company' ? 'active' : ''}`}
                        onClick={() => setActiveTab('company')}
                    >
                        Company information
                    </button>
                </div>
            </div>

            <div className="product-card">
                {activeTab === 'product' ? (
                    <ProductDetails item={item} />
                ) : (
                    <CompanyDetails item={item} formatDate={formatDate} />
                )}
            </div>
        </div>
    );
}