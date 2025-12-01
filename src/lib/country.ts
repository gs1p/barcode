// Country code formatter
export function formatCountryCode(code: string | number): string {
  // Handle if code is not a string
  if (!code) return '';
  
  const codeStr = String(code).trim();
  
  // M.49 numeric codes (UN geographic regions)
  const m49Codes: Record<string, string> = {
    '001': 'World',
    '002': 'Africa',
    '003': 'North America',
    '005': 'South America',
    '009': 'Oceania',
    '011': 'Western Africa',
    '013': 'Central America',
    '014': 'Eastern Africa',
    '015': 'Northern Africa',
    '017': 'Middle Africa',
    '018': 'Southern Africa',
    '019': 'Americas',
    '021': 'Northern America',
    '029': 'Caribbean',
    '030': 'Eastern Asia',
    '034': 'Southern Asia',
    '035': 'South-eastern Asia',
    '039': 'Southern Europe',
    '053': 'Australia and New Zealand',
    '054': 'Melanesia',
    '057': 'Micronesia',
    '061': 'Polynesia',
    '142': 'Asia',
    '143': 'Central Asia',
    '145': 'Western Asia',
    '150': 'Europe',
    '151': 'Eastern Europe',
    '154': 'Northern Europe',
    '155': 'Western Europe',
  };
  
  // Check if it's an M.49 code (numeric)
  if (/^\d{3}$/.test(codeStr)) {
    return m49Codes[codeStr] || `Region ${codeStr}`;
  }
  
  // ISO 3166-1 alpha-2 codes
  const countryNames: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'IE': 'Ireland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'CZ': 'Czech Republic',
    'RO': 'Romania',
    'HU': 'Hungary',
    'SK': 'Slovakia',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'SI': 'Slovenia',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'JP': 'Japan',
    'CN': 'China',
    'KR': 'South Korea',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'ZA': 'South Africa',
    'NZ': 'New Zealand',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'TR': 'Turkey',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'IL': 'Israel',
    'RU': 'Russia',
    'UA': 'Ukraine',
    'EG': 'Egypt',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'PK': 'Pakistan',
  };

  const upperCode = codeStr.toUpperCase();
  return countryNames[upperCode] || upperCode;
}