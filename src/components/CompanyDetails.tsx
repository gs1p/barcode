import { Copy } from 'lucide-react'; // 1. Import the icon

interface CompanyDetailsProps {
    item: any;
    formatDate: (dateString?: string) => string;
}

export default function CompanyDetails({ item, formatDate }: CompanyDetailsProps) {
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const openInMaps = () => {
        if (!item.gs1Licence?.address) return;
        
        const addressParts = [
            item.gs1Licence.address.streetAddress?.value,
            item.gs1Licence.address.addressLocality?.value,
            item.gs1Licence.address.addressRegion?.value,
            item.gs1Licence.address.postalCode,
            item.gs1Licence.address.countryCode
        ].filter(Boolean);
        
        const addressString = addressParts.join(', ');
        // 🚨 Note: The maps URL template in your original code seems slightly off.
        // It looks like you intended to use a full Google Maps URL with encodeURIComponent.
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;
        window.open(mapsUrl, '_blank');
    };

    return (
        <div className="company-info-section">
            <h2 className="company-info-title">
                Information about the company that licenced this GTIN
            </h2>

            <div className="company-details">
                {item.gs1Licence && (
                    <>
                        <div className="detail-row">
                            <span className="detail-label">Company Name</span>
                            <div className="detail-value-bold">{item.gs1Licence.licenseeName}</div>
                        </div>

                        {/* ... other details ... */}
                        
                        {item.gs1Licence.address && (
                            <div className="detail-row">
                                <span className="detail-label">Address</span>
                                <div className="detail-value-with-action">
                                    <div className="company-address">
                                        {item.gs1Licence.licenseeName && (
                                            <span className="company-address-line">{item.gs1Licence.licenseeName}</span>
                                        )}
                                        {item.gs1Licence.address.streetAddress && (
                                            <span className="company-address-line">
                                                {item.gs1Licence.address.streetAddress.value}
                                            </span>
                                        )}
                                        {item.gs1Licence.address.addressLocality && (
                                            <span className="company-address-line">
                                                {item.gs1Licence.address.addressLocality.value}
                                                {item.gs1Licence.address.addressRegion &&
                                                    `, ${item.gs1Licence.address.addressRegion.value}`}
                                            </span>
                                        )}
                                        {item.gs1Licence.address.postalCode && (
                                            <span className="company-address-line">
                                                {item.gs1Licence.address.postalCode}
                                            </span>
                                        )}
                                        {item.gs1Licence.address.countryCode && (
                                            <span className="company-address-line">
                                                {item.gs1Licence.address.countryCode}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={openInMaps}
                                        className="action-button"
                                        title="Open in maps"
                                    >
                                        {/* 2. Example: Using a MapPin icon instead of text */}
                                        Open in Map 
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* ... website ... */}
                        
                        {/* 🌟 THIS IS THE KEY CHANGE (License Key) 🌟 */}
                        <div className="detail-row">
                            <span className="detail-label">License Key</span>
                            <div className="detail-value-with-copy">
                                <span className="detail-value">{item.gs1Licence.licenceKey}</span>
                                <button 
                                    onClick={() => handleCopyToClipboard(item.gs1Licence.licenceKey)}
                                    className="copy-button"
                                    title="Copy to clipboard"
                                >
                                    {/* 3. Replaced "Copy" text with the Lucide-React Copy icon */}
                                    <Copy size={16} /> 
                                </button>
                            </div>
                        </div>

                        {/* 🌟 (License Type) 🌟 */}
                        <div className="detail-row">
                            <span className="detail-label">License Type</span>
                            <div className="detail-value-with-copy">
                                <span className="detail-value">{item.gs1Licence.licenceType}</span>
                                <button 
                                    onClick={() => handleCopyToClipboard(item.gs1Licence.licenceType)}
                                    className="copy-button"
                                    title="Copy to clipboard"
                                >
                                    {/* 4. Replaced "Copy" text with the Lucide-React Copy icon */}
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        
                        {/* ... GLN and Licensing MO details ... */}

                    </>
                )}
            </div>

            <div className="company-footer">
                Licence information was provided by {item.gs1Licence?.licensingMO?.moName || 'GS1'} and was last updated on {formatDate(item.dateUpdated || item.dateCreated)}.
            </div>
        </div>
    );
}