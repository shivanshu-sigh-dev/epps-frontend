import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosConfig";

const Prescription = () => {
    const [images, setImages] = useState([]);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [prescriptionData, setPrescriptionData] = useState(null);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axiosInstance.get("/patients/");
                setPatients(response.data);
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };

        fetchPatients();
    }, []);

    const handleImageChange = (event) => {
        setImages(event.target.files); // Store the files in state
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (images.length === 0) {
            return;
        }
        const formData = new FormData();

        // Append each selected image to the FormData object
        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }
        setUploadSuccess(false);
        setLoading(true);

        try {
            // Send a POST request to upload the images
            const response = await axiosInstance.post(
                "/upload-multiple-images/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setPrescriptionData(response.data.d_info);
            setUploadSuccess(true); // Update state to indicate success
        } catch (error) {
            console.error("Error uploading images:", error);
        } finally {
            setLoading(false); // Hide spinner after request completes
        }
    };

    const handleLinkPatient = async () => {
        setLoading(true);
        if (!selectedPatient || !prescriptionData) {
            return;
        }
        for (const prescription of prescriptionData) {
            const responsePrescription = await axiosInstance.post("/prescriptions/", {
                patient: selectedPatient,
                image_url: prescription.image_url
            });
            for(const drug of prescription.prescription_data) {
                await axiosInstance.post("/druginformation/", {
                    prescription: responsePrescription.data.id,
                    drug_name: drug.NAME,
                    dosage: drug.DOSAGE || "N/A",
                    strength: drug.STRENGTH || "N/A",
                    frequency: drug.FREQUENCY || "N/A",
                    duration: drug.DURATION || "N/A"
                });
            }
        }
        setImages([]);
        setUploadSuccess(false);
        setLoading(false);
        setPrescriptionData(null);
        setSelectedPatient('');
    };

    return (
        <div className="container">
            <h1 className="mt-4">Electronic Prescription Processing System</h1>
            <h5 className="mt-4 align-left">Process Prescription Images</h5>
            {loading && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-2">
                    Start Processing
                </button>
            </form>
            {uploadSuccess && (
                <p className="mt-2 text-success">Images processed successfully!</p>
            )}
            <div className="form-group">
                <h5 className="mt-4 align-left">Link Processed Prescription to a Patient</h5>
                <select
                    className="form-control"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                >
                    <option value="">-- Select Patient --</option>
                    {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                            {patient.id} - {patient.name}
                        </option>
                    ))}
                </select>
                <button className="btn btn-primary mt-2" onClick={handleLinkPatient}>
                    Complete Linking
                </button>
            </div>
            {prescriptionData && (
                <div className="prescription-table mt-4">
                    {prescriptionData.map((prescription, index) => (
                        <div key={index} className="prescription-section">
                            <b>Prescription Image:</b> {prescription.image_url.substring(prescription.image_url.lastIndexOf("/") + 1)}
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Dosage</th>
                                        <th>Strength</th>
                                        <th>Duration</th>
                                        <th>Frequency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescription.prescription_data.map((drug, idx) => (
                                        <tr key={idx}>
                                            <td>{drug.NAME}</td>
                                            <td>{drug.DOSAGE || "N/A"}</td>
                                            <td>{drug.STRENGTH || "N/A"}</td>
                                            <td>{drug.DURATION || "N/A"}</td>
                                            <td>{drug.FREQUENCY || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Prescription;
