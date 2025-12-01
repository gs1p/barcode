// API Service for GTIN lookup
// Direct API call to GS1 Verified by GS1 API

const API_KEY = '7bbf3e3a2490411e89eefd07bea551fa';
const API_URL = 'https://grp.gs1.org/grp/v3.2/gtins/verified';

export async function searchGTIN(gtin: string) {
  try {
    // Pad GTIN to 14 digits if needed
    const paddedGtin = gtin.padStart(14, '0');

    console.log('Making API call for GTIN:', paddedGtin);

    // Validate GTIN length
    if (paddedGtin.length !== 14 || !/^\d+$/.test(paddedGtin)) {
      throw new Error('GTIN must be 14 digits');
    }

    // Call VbG API directly
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'APIKey': API_KEY,
      },
      body: JSON.stringify([paddedGtin]),
    });

    console.log('API Response Status:', response.status);

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('VbG API Error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('API key is not authorized. Please check your GS1 API key.');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden. Your API key may not have the required permissions.');
      }

      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse and return the data
    const data = await response.json();
    console.log('API Data received:', data);
    return data;

  } catch (error: any) {
    console.error('API Service Error:', error);
    throw new Error(error.message || 'An error occurred while fetching data');
  }
}