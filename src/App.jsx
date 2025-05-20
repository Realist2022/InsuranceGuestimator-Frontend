import React, { useState } from "react";
import axios from "axios";
import styles from "./App.module.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    vehicleType: "",
  }); // FOR FORM DATA
  const [selectedFile, setSelectedFile] = useState(null); // FOR FILE UPLOAD
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // FOR IMAGE PREVIEW
  const [uploading, setUploading] = useState(false); // FOR UPLOADING
  const [results, setResults] = useState(null); // FOR DISPLAYING RESULTS
  const [error, setError] = useState(null); // FOR ERROR HANDLING
  const [isDragging, setIsDragging] = useState(false); // FOR DRAG AND DROP

  // HANDLE INPUT CHANGE: Linked to onChange events inside the form.
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Targets the name and value of the input field.

    // Updates formData state with the new values
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // HANDLE FILE CHANGE: Handle file selection and validation
  const handleFileChange = (event) => {
    const file = event.target.files
      ? event.target.files[0]
      : event.dataTransfer.files[0];

    // BASIC FILE VALIDATION: This is for checking file type and size
    if (file) {
      // FILE TYPE VALIDATION
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/bmp",
        "image/gif",
      ];
      const maxSizeMB = 6; //set size at 6mb, I may need to change to 4mb..?
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      // FILE VALIDATION EXECUTION
      if (allowedTypes.includes(file.type) && file.size <= maxSizeBytes) {
        setSelectedFile(file);

        // --- IMAGE PREVIEW LOGIC ---
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviewUrl(reader.result); // Set the Data URL to state
        };
        reader.readAsDataURL(file); // Read the file as a Data URL
        // --- END IMAGE PREVIEW LOGIC ---
      } else {
        alert(
          `Invalid file type or size. Please upload PNG, JPG, jpeg, BMP, or GIF up to ${maxSizeMB}MB.`
        );
        setSelectedFile(null); // Clear selection if invalid
        setImagePreviewUrl(null); // Clear preview if invalid
      }
    } else {
      // This happens if the file input is cancelled
      setSelectedFile(null);
      setImagePreviewUrl(null);
    }
  };

  // HANDLE DRAG OVER
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // HANDLE DRAG LEAVE
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // HANDLE DROP
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event);
  };

  // HANDLE FORM SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if a file is selected
    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    // Check if vehicleType is selected
    if (!formData.vehicleType) {
      setError("Please select a vehicle type.");
      return;
    }

    setUploading(true);
    setResults(null); // Clear previous results
    setError(null); // Clear previous errors

    // Create FormData object to send files and text data
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("number", formData.number);
    data.append("vehicleType", formData.vehicleType); // Append selected vehicle type
    data.append("vehicleImage", selectedFile); // Append the selected file

    try {
      // Make POST request to backend endpoint
      const response = await axios.post(
        "http://localhost:4000/api/upload",
        data
      );

      setResults(response.data); // Set results from backend
    } catch (err) {
      console.error("Upload Error:", err);
      setError("Error uploading image or processing request.");
      // More detailed error handling:
      if (err.response) {
        console.error("Error response data:", err.response.data);
        setError(
          `Error: ${
            err.response.data.error ||
            err.response.statusText ||
            "Server responded with an error."
          }`
        );
      } else if (err.request) {
        console.error("Error request:", err.request);
        setError("Error: No response received from server.");
      } else {
        console.error("Error message:", err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.AppContainer}>
      <div className={styles.App}>
        <h1>Insurance Form Guestimator</h1>
        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            placeholder="Enter your name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          {/* EMAIL */}
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {/* PHONE NUMBER */}
          <label htmlFor="number">Phone Number:</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            id="number"
            name="number"
            value={formData.number}
            onChange={handleInputChange}
            required
          />
          {/* VEHICLE TYPE SELECT */}
          <label htmlFor="vehicleType">Vehicle type:</label>
          <select
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            required
          >
            <option value="">--Select Type--</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Truck">Truck</option>
          </select>

          {/* FILE/IMAGE UPLOAD */}
          <div
            className={`${styles["uploadArea"]} ${
              isDragging ? styles["dragging"] : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            // Clicking the div triggers the hidden file input
            onClick={() => document.getElementById("vehicleImage").click()}
          >
            <input
              name="vehicleImage" // Match the name used in multer on the backend
              id="vehicleImage"
              type="file"
              accept=".png,.jpg,.jpeg,.bmp,.gif"
              onChange={handleFileChange}
              style={{ display: "none" }} // Hide the default file input
            />

            {/* --- Conditional Rendering for Image Preview --- */}
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Selected file preview"
                className={styles.imagePreview}
              />
            ) : (
              // Show default content if no file is selected or preview fails
              <>
                <div className={styles.uploadIcon}>🖼️ +</div>
                <p>Click to upload or drag and drop</p>
              </>
            )}
            {/* --- End Conditional Rendering --- */}

            {/* Display selected file name below preview or default text */}
            {selectedFile && (
              <p className={styles.fileName}>{selectedFile.name}</p>
            )}

            <p className={styles.fileInfo}>PNG, JPG, BMP, or GIF (MAX. 6MB)</p>
          </div>

          {/* SUBMIT BUTTON: This button is disabled until required fields */}
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Submit and Classify"}
          </button>
        </form>

        {/* DISPLAY RESULTS */}
        {results && (
          <div className={styles.results}>
            <h2>Results</h2>
            <ul>
              {/* Check if formData exists before accessing properties */}
              {results.formData && (
                <>
                  <li>Name: {results.formData.name}</li>
                  <li>Email: {results.formData.email}</li>
                  <li>Number: {results.formData.number}</li>
                  <li>Vehicle Type Chosen: {results.formData.vehicleType}</li>
                </>
              )}
            </ul>

            <p>
              <strong>Insurance Summary:</strong>
              {results.basePrice
                ? `${results.basePrice}`
                : " No base price available."}
            </p>
          </div>
        )}

        {/* DISPLAY ERROR: if all fails */}
        {error && (
          <div className={styles.error}>
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
