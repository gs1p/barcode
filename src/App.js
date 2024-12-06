
import React, { useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState("");
  const [category, setCategory] = useState("general");
  const [result, setResult] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [numbers, setNumbers] = useState({ num1: "", num2: "", num3: "", num4: "" });
  const [multiplicationResult, setMultiplicationResult] = useState(null);

  const handleClear = () => {
    setProducts("");
    setCategory("general");
    setResult("");
    setShowPopup(false);
    setNumbers({ num1: "", num2: "", num3: "", num4: "" });
    setMultiplicationResult(null);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSubmit = () => {
    const productNumber = parseInt(products, 10);

    if (category === "general" || category === "textile") {
      if (productNumber > 10000) {
        setShowPopup(true);
        return;
      }
    } else if (category === "health care" || category === "UDI") {
      if (productNumber > 1000) {
        setShowPopup(true);
        return;
      }
    }

    let recommendation = "";
    if (category === "general") {
      if (productNumber === 1) {
        recommendation = `General Category

Recommendation: License 1 GLN
Entrance Fee: Rs 22,695 (incl. Govt. Taxes)
Annual Fee: Rs 7,566 (incl. Govt. Taxes)
Total Amount: Rs 30,261`;
      } else if (productNumber <= 100) {
        recommendation = `General Category

Recommendation: License 100 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 12,105 (incl. Govt. Taxes)
Total Amount: Rs 57,497`;
      } else if (productNumber <= 1000) {
        recommendation = `General Category

Recommendation: License 1,000 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 30,261 (incl. Govt. Taxes)
Total Amount: Rs 75,653`;
      } else if (productNumber <= 10000) {
        recommendation = `General Category

Recommendation: License 10,000 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 180,959 (incl. Govt. Taxes)
Total Amount: Rs 226,351`;
      }
    }
    // Other categories follow...
    setResult(recommendation);
  };

  const handleMultiply = () => {
    const { num1, num2, num3, num4 } = numbers;
    if (num1 && num2 && num3 && num4) {
      const product = [num1, num2, num3, num4].reduce((acc, curr) => acc * parseInt(curr, 10), 1);
      setMultiplicationResult(product);
    } else {
      setMultiplicationResult("Please enter all four numbers.");
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setNumbers({ ...numbers, [name]: value });
  };

  return (
    <div className="app-container">
      <h1> Barcode Estimator </h1>
      

      <div className="number-multiply-container">
        <h3>Estimate How Many Barcodes You Need</h3>
        
        <input type="number" name="num1" value={numbers.num1} onChange={handleNumberChange} placeholder="Sizes" />
        <input type="number" name="num2" value={numbers.num2} onChange={handleNumberChange} placeholder="Colours/flavours:" />
        <input type="number" name="num3" value={numbers.num3} onChange={handleNumberChange} placeholder="Styles/Varieties:
" />
        <input type="number" name="num4" value={numbers.num4} onChange={handleNumberChange} placeholder="Other Variations:" />
        <button onClick={handleMultiply}>figure it out!</button>
        {multiplicationResult !== null && <p> Total GTINs required: {multiplicationResult}</p>}
      </div>

      

      <div className="input-container">
      <h1>Check Your Barcode & Verification Fees!</h1>
      <h2>Any individual, firm, or company applying for GTIN/GLN-13, or GTIN-8 barcode numbers will be required to pay the following Entrance and Annual Fees along with the GS1 Pakistan Standard Application Form duly completed.</h2>
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
            <option value="Verification 1D">Verification 1D</option>
            <option value="Verification 2D (Data Matrix)">Verification 2D (Data Matrix)</option>
          </select>
        </label>
      </div>

      

      <div className="button-container">
        <button onClick={handleSubmit}>Check Fees</button>
        <button onClick={handleClear}>Clear Values</button>
        <button onClick={() => window.open("https://www.gs1pk.org/Getabarcode", "_blank")}>Get a Barcode</button>
      </div>
      {result && <div className="result-container">{result}</div>}
      <div id="terms-details" class="terms-details">
  <h3>Terms and Conditions</h3>
  <p>
     1. Annual fees are due one calendar year from the allocation date.<br />
     2. From the second year onward, companies are required to pay the annual renewal fee.<br />
     3. A late fee charge of <strong>5%</strong> will be applied to the total invoice amount after the due date.
  </p>
  <p>
   
  </p>
</div>
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
