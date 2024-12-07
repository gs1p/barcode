
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
Total Fees: Rs 30,261`;
      }  else if (productNumber <= 100) {
        recommendation = `General Category

Recommendation: License 100 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 12,105 (incl. Govt. Taxes)
Total Fees: Rs 57,497`;
      } else if (productNumber <= 1000) {
        recommendation = `General Category

Recommendation: License 1,000 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 30,261 (incl. Govt. Taxes)
Total Fees: Rs 75,653`;
      } else if (productNumber <= 10000) {
        recommendation = `General Category

Recommendation: License 10,000 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 180,959 (incl. Govt. Taxes)
Total Fees: Rs 226,351`;
      }
    } else if (category === "textile") {
      if (productNumber <= 100) {
        recommendation = `Textile Category

Recommendation: License 100 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 12,105 (incl. Govt. Taxes)
Total Fees: Rs 57,497`;
      } else if (productNumber <= 1000) {
        recommendation = `Textile Category

Recommendation: License 1,000 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 30,261 (incl. Govt. Taxes)
Total Fees: Rs 75,653`;
      } else if (productNumber <= 10000) {
        recommendation = `Textile Category

Recommendation: License 10,000 GTIN-13s
Entrance Fee: Rs 45,392 (incl. Govt. Taxes)
Annual Fee: Rs 180,959 (incl. Govt. Taxes)
Total Fees: Rs 226,351`;
      }
    } else if (category === "health care") {
      if (productNumber <= 100) {
        recommendation = `Healthcare Category

Recommendation: License 100 GTIN-13s
Entrance Fee: Rs 68,087 (incl. Govt. Taxes)
Annual Fee: Rs 18,156 (incl. Govt. Taxes)
Total Fees: Rs 86,243`;
      } else if (productNumber <= 1000) {
        recommendation = `Healthcare Category

Recommendation: License 1,000 GTIN-13s
Entrance Fee: Rs 68,087 (incl. Govt. Taxes)
Annual Fee: Rs 45,392 (incl. Govt. Taxes)
Total Fees: Rs 113,479`;
      }
    } else if (category === "UDI") {
      if (productNumber <= 100) {
        recommendation = `UDI Category

Recommendation: License 100 GTIN-13s
Entrance Fee: Rs 68,087 (incl. Govt. Taxes)
Annual Fee: Rs 54,468 (incl. Govt. Taxes)
Total Fees: Rs 122,555`;
      } else if (productNumber <= 1000) {
        recommendation = `UDI Category

Recommendation: License 1,000 GTIN-13s
Entrance Fee: Rs 68,087 (incl. Govt. Taxes)
Annual Fee: Rs 136,175 (incl. Govt. Taxes)
Total Fees: Rs 204,262`;
      }
    } else if (category === "Verification 1D") {
      if (productNumber <= 10) {
        recommendation = `Verification 1D

Barcode Verification Fees of 1D
EAN - 13's Verification Fees: License 1 - 10 GTIN
Total Fees: Rs 907`;
      } else if (productNumber > 10) {
        recommendation = `Verification 1D

Barcode Verification Fees of 1D
EAN - 13's Verification Fees: License Above 10 GTIN
Total Fees: Rs 756`;
      }
    } else if (category === "Verification 2D (Data Matrix)") {
      if (productNumber <= 10) {
        recommendation = `Verification 2D (Data Matrix)

Barcode Verification Fees of 2D (Data Matrix)
2D Data Matrix - 14's Verification Fees: License 1 - 10 GTIN
Total Fees: Rs 1,665`;
      } else if (productNumber > 10) {
        recommendation = `Verification 2D (Data Matrix)

Barcode Verification Fees of 2D (Data Matrix)
2D Data Matrix - 14's Verification Fees: License Above 10 GTIN
Total Fees: Rs 1,513`;
      }
    }

    setResult(recommendation);
  };

  const handleMultiply = () => {
    const { num1, num2, num3, num4 } = numbers;
  
    // Replace blank or zero values with 1
    const parsedNumbers = {
      num1: num1 && parseInt(num1, 10) > 0 ? parseInt(num1, 10) : 1,
      num2: num2 && parseInt(num2, 10) > 0 ? parseInt(num2, 10) : 1,
      num3: num3 && parseInt(num3, 10) > 0 ? parseInt(num3, 10) : 1,
      num4: num4 && parseInt(num4, 10) > 0 ? parseInt(num4, 10) : 1,
    };
  
    // Calculate the product
    const product = Object.values(parsedNumbers).reduce((acc, curr) => acc * curr, 1);
    setMultiplicationResult(product);
  
    // Update the numbers state to reflect the replaced values
    setNumbers(parsedNumbers);
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setNumbers({ ...numbers, [name]: value });
  };
  
  return (
    <div className="app-container">
      <h1>Barcode Estimator</h1>
  
      <div className="number-multiply-container">
        <h3>Estimate How Many Barcodes You Need</h3>
  
        <input
          type="number"
          name="num1"
          value={numbers.num1}
          onChange={handleNumberChange}
          placeholder="Sizes/Net Content:"
        />
        <input
          type="number"
          name="num2"
          value={numbers.num2}
          onChange={handleNumberChange}
          placeholder="Colors/Flavors/Scents:"
        />
        <input
          type="number"
          name="num3"
          value={numbers.num3}
          onChange={handleNumberChange}
          placeholder="Styles/Varieties/Models:"
        />
        <input
          type="number"
          name="num4"
          value={numbers.num4}
          onChange={handleNumberChange}
          placeholder="Other Variations/Attributes:"
        />
        <button onClick={handleMultiply}>figure it out!</button>
        {multiplicationResult !== null && (
  <div className="result-box">Total GTINs required: {multiplicationResult}</div>
)}
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
     3. A late fee charge of <strong>5%</strong> will be applied to the total invoice amount after the due date.<br />
     4. You must pay the Membership Fee to GS1 annually within<strong> 30 days </strong> of the date of GS1's invoice.<br />
     5. GS1 may, from time to time, increase the Membership Fee.<br />
     6. GS1 Pakistan may terminate the License immediately by giving notice if You fail to pay the Membership Fee by its due
date.
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
