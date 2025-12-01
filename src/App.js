import React, { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    streetAddress: "",
    city: "",
    postCode: "",
    telephone: "",
    email: "",
    tradingZones: "",
    taxNo: "",
    companyRegNo: "",
    noOfEmployees: "",
    website: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(
      "https://script.google.com/macros/s/AKfycbzu6lwFHoPJ1s6HD7_ci9w3j-iVOl9bOER7vvraLMu6G6Ug2j3OxVP1AUX_VLLRMGyfqQ/exec",
      {
        method: "POST",
        mode: "no-cors", // Bypasses CORS but prevents reading response
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    alert("Form submitted! Check your Google Sheet.");
    setFormData({
      name: "",
      companyName: "",
      streetAddress: "",
      city: "",
      postCode: "",
      telephone: "",
      email: "",
      tradingZones: "",
      taxNo: "",
      companyRegNo: "",
      noOfEmployees: "",
      website: "",
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container">
      <h1>GS1 Application Form</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="companyName">Company Name</label>
        <input
          type="text"
          name="companyName"
          id="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={(e) => {
            const value = e.target.value;
            const pascalCaseValue = value
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            handleChange({ target: { name: 'companyName', value: pascalCaseValue } });
          }}
          required
        />

        <label htmlFor="streetAddress">Street Ad</label>
        <input
          type="text"
          name="streetAddress"
          id="streetAddress"
          placeholder="Street Address"
          value={formData.streetAddress}
          onChange={(e) => {
            const value = e.target.value;
            const pascalCaseValue = value
              .split(' ')
              .map(word => {
                // Capitalize the first letter and lowercase the rest
                return word
                  .split('-') // Split words with hyphens (like 3-km)
                  .map(subWord => subWord.charAt(0).toUpperCase() + subWord.slice(1).toLowerCase())
                  .join('-'); // Join back words with hyphens
              })
              .join(' '); // Join all words with spaces

            handleChange({ target: { name: 'streetAddress', value: pascalCaseValue } });
          }}
          required
        />


        <label htmlFor="city">City</label>
        <input
          type="text"
          name="city"
          id="city"
          placeholder="City"
          value={formData.city}
          onChange={(e) => {
            const value = e.target.value;

            // Ensure only letters and spaces are allowed
            if (/[^a-zA-Z\s]/.test(value)) {
              return; // Prevent the change if a non-letter or number is entered
            }

            // Remove spaces and capitalize the first letter of the string
            const pascalCaseValue = value
              .replace(/\s+/g, '') // Remove all spaces
              .replace(/^[a-z]/, (match) => match.toUpperCase()); // Capitalize the first letter

            handleChange({ target: { name: 'city', value: pascalCaseValue } });
          }}
          required
        />




        <label htmlFor="postCode">Post Code</label>
        <input
          type="text"
          name="postCode"
          id="postCode"
          placeholder="Post Code"
          value={formData.postCode}
          onChange={handleChange}
          required
        />

        <label htmlFor="telephone">Telephone</label>
        <input
          type="text"
          name="telephone"
          id="telephone"
          placeholder="Telephone"
          value={formData.telephone}
          onChange={(e) => {
            const value = e.target.value;

            // Allow only numbers (0-9)
            if (/[^0-9]/.test(value)) {
              return; // Prevent the change if non-numeric characters are entered
            }

            handleChange({ target: { name: 'telephone', value: value } });
          }}
          required
        />


        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="tradingZones">Trading Zones</label>
        <input
          type="text"
          name="tradingZones"
          id="tradingZones"
          placeholder="Trading Zones"
          value={formData.tradingZones}
          onChange={handleChange}
          required
        />

        <label htmlFor="taxNo">Tax No</label>
        <input
          type="text"
          name="taxNo"
          id="taxNo"
          placeholder="Tax No"
          value={formData.taxNo}
          onChange={handleChange}
          required
        />

        <label htmlFor="companyRegNo">Company Registration No</label>
        <input
          type="text"
          name="companyRegNo"
          id="companyRegNo"
          placeholder="Company Registration No"
          value={formData.companyRegNo}
          onChange={handleChange}
          required
        />

        <label htmlFor="noOfEmployees">No of Employees</label>
        <input
          type="number"
          name="noOfEmployees"
          id="noOfEmployees"
          placeholder="No of Employees"
          value={formData.noOfEmployees}
          onChange={handleChange}
          required
        />

        <label htmlFor="website">Website</label>
        <input
          type="url"
          name="website"
          id="website"
          placeholder="Website"
          value={formData.website}
          onChange={handleChange}
          required
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
