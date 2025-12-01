import { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface CompanyDetailsProps {
    item: any;
    formatDate: (dateString?: string) => string;
}

export default function CompanyDetails({ item, formatDate }: CompanyDetailsProps) {
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedGLN, setCopiedGLN] = useState(false);

    const handleCopyToClipboard = (text: string, type: 'key' | 'gln') => {
        navigator.clipboard.writeText(text);
        if (type === 'key') {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } else if (type === 'gln') {
            setCopiedGLN(true);
            setTimeout(() => setCopiedGLN(false), 2000);
        }
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
                        {/* Company Name */}
                        <div className="detail-row">
                            <span className="detail-label">Company Name</span>
                            <div className="detail-value-bold">{item.gs1Licence.licenseeName}</div>
                        </div>

                        {/* Address */}
                        {item.gs1Licence.address && (
                            <div className="detail-row" style={{ marginBottom: '1rem', position: 'relative', paddingRight: '6rem' }}>
                                <span className="detail-label" style={{ fontWeight: 600, color: '#374151' }}>Address</span>
                                
                                <div className="company-address" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                    {item.gs1Licence.licenseeName && (
                                        <span className="company-address-line" style={{ color: '#111827' }}>{item.gs1Licence.licenseeName}</span>
                                    )}
                                    {item.gs1Licence.address.streetAddress && (
                                        <span className="company-address-line" style={{ color: '#111827' }}>
                                            {item.gs1Licence.address.streetAddress.value}
                                        </span>
                                    )}
                                    {item.gs1Licence.address.addressLocality && (
                                        <span className="company-address-line" style={{ color: '#111827' }}>
                                            {item.gs1Licence.address.addressLocality.value}
                                            {item.gs1Licence.address.addressRegion &&
                                                `, ${item.gs1Licence.address.addressRegion.value}`}
                                        </span>
                                    )}
                                    {item.gs1Licence.address.postalCode && (
                                        <span className="company-address-line" style={{ color: '#111827' }}>
                                            {item.gs1Licence.address.postalCode}
                                        </span>
                                    )}
                                    {item.gs1Licence.address.countryCode && (
                                        <span className="company-address-line" style={{ color: '#111827' }}>
                                            {item.gs1Licence.address.countryCode}
                                        </span>
                                    )}
                                </div>

                                {/* Open in Maps Button */}
                                <button
                                    onClick={openInMaps}
                                    title="Open in maps"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor: '#c0c0c0ff',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease-in-out',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
                                >
                                    Open in Map
                                </button>
                            </div>
                        )}

                        {/* Website */}
                        {item.gs1Licence.contactPoint && item.gs1Licence.contactPoint.length > 0 && (
                            <div className="detail-row">
                                <span className="detail-label">Website</span>
                                <a
                                    href={item.gs1Licence.contactPoint[0].website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="detail-value-link"
                                >
                                    {item.gs1Licence.contactPoint[0].website}
                                </a>
                            </div>
                        )}

                        {/* License Key */}
                        <div className="detail-row" style={{ marginBottom: '1rem', position: 'relative', paddingRight: '6rem' }}>
                            <span className="detail-label" style={{ fontWeight: 600, color: '#374151' }}>License Key</span>
                            <div className="detail-value-with-copy" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="detail-value" style={{ color: '#111827', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                    {item.gs1Licence.licenceKey}
                                </span>
                            </div>
                            <button
                                onClick={() => handleCopyToClipboard(item.gs1Licence.licenceKey, 'key')}
                                title="Copy to clipboard"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    backgroundColor: copiedKey ? '#10b981' : '#c0c0c0ff',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                            >
                                {copiedKey ? <Check size={16} /> : <Clipboard size={16} />}
                                {copiedKey ? 'Copied' : 'Copy'}
                            </button>
                        </div>

                        {/* License Type */}
                        <div className="detail-row">
                            <span className="detail-label">License Type</span>
                            <div className="detail-value-with-copy">
                                <span className="detail-value">{item.gs1Licence.licenceType}</span>
                            </div>
                        </div>

                        {/* GLN */}
                        {item.gs1Licence.licenseeGLN && (
                            <div className="detail-row" style={{ position: 'relative', paddingRight: '6rem', marginBottom: '1rem' }}>
                                <span className="detail-label">Global Location Number (GLN)</span>
                                <div className="detail-value-with-copy" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span className="detail-value">{item.gs1Licence.licenseeGLN}</span>
                                </div>
                                <button
                                    onClick={() => handleCopyToClipboard(item.gs1Licence.licenseeGLN, 'gln')}
                                    title="Copy to clipboard"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        backgroundColor: copiedGLN ? '#10b981' : '#c0c0c0ff',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease-in-out',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    {copiedGLN ? <Check size={16} /> : <Clipboard size={16} />}
                                    {copiedGLN ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        )}

                        {/* Licensing MO */}
                        {item.gs1Licence.licensingMO && (
                            <div className="detail-row">
                                <span className="detail-label">Licensing GS1 Member Organisation</span>
                                <span className="detail-value">{item.gs1Licence.licensingMO.moName}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
<div
  className="company-footer"
  style={{
    marginTop: '2rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#b2ffc5ff', // light gray background
    color: '#000000ff',           // dark gray text
    fontSize: '0.9rem',       // slightly smaller font
    borderRadius: '0.5rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)', // subtle shadow
    lineHeight: '1.5',
    textAlign: 'center',
  }}
>
  Licence information was provided by <b>{item.gs1Licence?.licensingMO?.moName || 'GS1'}</b> and was last updated on <b>{formatDate(item.dateUpdated || item.dateCreated)}</b>.
</div>

        </div>
    );
}
