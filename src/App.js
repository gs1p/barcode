import React, { useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState("");
  const [category, setCategory] = useState("general");
  const [result, setResult] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State for the popup
 

  const handleClear = () => {
    setProducts("");
    setCategory("general");
    setResult("");
    setShowPopup(false); // Ensure popup is hidden when clearing values
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSubmit = () => {
    const productNumber = parseInt(products, 10);

    if (category === "general" || category === "textile") {
      if (productNumber > 10000) {
        setShowPopup(true); // Show popup if limit exceeded
        return;
      }
    } else if (category === "health care" || category === "UDI") {
      if (productNumber > 1000) {
        setShowPopup(true); // Show popup if limit exceeded
        return;
      }
    }

    let recommendation = "";
    if (category === "general") {
      if (productNumber === 1) {
        recommendation = `General Category


Recommendation: Purchase 1 GTIN-13
Entrance Fee: 22,695 (incl. Govt. Taxes)
Annual Fee: 7,566 (incl. Govt. Taxes)
Total Due: 30,261`;
      } else if (productNumber === 10) {
        recommendation = `General Category


Recommendation: Purchase 10 GTIN-13s
Entrance Fee: 22,695 (incl. Govt. Taxes)
Annual Fee: 7,566 (incl. Govt. Taxes)
Total Due: 30,261`;
      } else if (productNumber <= 100) {
        recommendation = `General Category


Recommendation: Purchase 100 GTIN-13s
Entrance Fee: 45,392 (incl. Govt. Taxes)
Annual Fee: 12,105 (incl. Govt. Taxes)
Total Due: 57,497`;
      } else if (productNumber <= 1000) {
        recommendation = `General Category


Recommendation: Purchase 1,000 GTIN-13s
Entrance Fee: 45,392 (incl. Govt. Taxes)
Annual Fee: 30,261 (incl. Govt. Taxes)
Total Due: 75,653`;
      } else if (productNumber <= 10000) {
        recommendation = `General Category


Recommendation: Purchase 10,000 GTIN-13s
Entrance Fee: 45,392 (incl. Govt. Taxes)
Annual Fee: 180,959 (incl. Govt. Taxes)
Total Due: 226,351`;
      }
    } else if (category === "textile") {
      if (productNumber <= 100) {
        recommendation = `Textile Category


Recommendation: Purchase 100 GTIN-13s
Entrance Fee: 45,392 (incl. Govt. Taxes)
Annual Fee: 12,105 (incl. Govt. Taxes)
Total Due: 57,497`;
      } else if (productNumber <= 1000) {
        recommendation = `Textile Category


Recommendation: Purchase 1,000 GTIN-13s
Entrance Fee: 45,392 (incl. Govt. Taxes)
Annual Fee: 30,261 (incl. Govt. Taxes)
Total Due: 75,653`;
      } else if (productNumber <= 10000) {
        recommendation = `Textile Category


Recommendation: Purchase 10,000 GTIN-13s
Entrance Fee: 45,392 (incl. Govt. Taxes)
Annual Fee: 180,959 (incl. Govt. Taxes)
Total Due: 226,351`;
      }
    } else if (category === "health care") {
      if (productNumber <= 100) {
        recommendation = `Healthcare Category


Recommendation: Purchase 100 GTIN-13s
Entrance Fee: 68,087 (incl. Govt. Taxes)
Annual Fee: 18,156 (incl. Govt. Taxes)
Total Due: 86,243`;
      } else if (productNumber <= 1000) {
        recommendation = `Healthcare Category


Recommendation: Purchase 1,000 GTIN-13s
Entrance Fee: 68,087 (incl. Govt. Taxes)
Annual Fee: 45,392 (incl. Govt. Taxes)
Total Due: 113,479`;
      }
    } else if (category === "UDI") {
      if (productNumber <= 100) {
        recommendation = `UDI Category


Recommendation: Purchase 100 GTIN-13s
Entrance Fee: 68,087 (incl. Govt. Taxes)
Annual Fee: 54,468 (incl. Govt. Taxes)
Total Due: 122,555`;
      } else if (productNumber <= 1000) {
        recommendation = `UDI Category


Recommendation: Purchase 1,000 GTIN-13s
Entrance Fee: 68,087 (incl. Govt. Taxes)
Annual Fee: 136,175 (incl. Govt. Taxes)
Total Due: 204,262`;
      }
    }

    setResult(recommendation);
  };

  return (
    <div className="app-container">
      <h1>Barcode Estimator</h1>
      <h2>Any Individual/Firm/Company applying for the GTIN-13/GLN or GTIN-8 barcode numbers will be required to pay following Entrance and Annual Fees along with the GS1 Pakistan Standard Application Form duly completed.</h2>
     
        
      <div className="input-container">
        <label>
          
Please Indicate Below the Number of Global Trade Item Numbers (GTIN's) You Require: 
          <input
            type="number"
            value={products}
            onChange={(e) => setProducts(e.target.value)}
            placeholder="Enter the number of products"
          />
        </label>
        <label>
          Product category that best identifies your business.
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="general">General</option>
            <option value="textile">Textile</option>
            <option value="health care">Health Care</option>
            <option value="UDI">UDI</option>
          </select>
        </label>
      </div>
      <div className="button-container">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={handleClear}>Clear Values</button>
        <button onClick={() => window.open("https://www.gs1pk.org/Getabarcode", "_blank")}>Get a Barcode</button>
      </div>
      {result && <div className="result-container">{result}</div>}
      
  

      <div id="terms-details" class="terms-details">
  <h3>Terms and Conditions</h3>
  <p>
    <strong>1. Entrance Fee Payment</strong><br />
    Members availing the 50% discount on the Entrance Fee are required to pay the remaining amount of 
    <strong> Rs. 16,304</strong> plus <strong>16% PRA</strong> when applying for additional numbers.
  </p>
  <p>
    <strong>2. Annual Fees</strong><br />
    - Annual fees are due one calendar year from the allocation date.<br />
    - From the second year onward, companies are required to pay the annual renewal fee.<br />
    - For example:<br />
      &nbsp;&nbsp;&nbsp;- If you request 300 GTIN-13s, you will need to pay <strong>Rs. 60,523/- </strong> 
      (Entrance + Annual Fees) for the first year.<br />
      &nbsp;&nbsp;&nbsp;- For subsequent years, the annual renewal fee will be <strong>Rs. 15,131/-</strong>.
  </p>
  <p>
    <strong>3. Late Fee Charges</strong><br />
    A late fee charge of <strong>5%</strong> will be applied to the total invoice amount after the due date.
  </p>
</div>


      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <h3>Please Contact Us</h3>
            <p>The number of products entered exceeds the limit for your selected category. Please contact us for more details.</p>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
      
    </div>

  );
}

export default App;
