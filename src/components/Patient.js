import React, { useState, useEffect } from "react";
import { set, useForm } from "react-hook-form";
import axiosInstance from './axiosConfig';

const Patient = () => {
    const { register, handleSubmit, errors, reset } = useForm();
    const [patients, setPatients] = useState([]);
    const [editPatient, setEditPatient] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [drugInformation, setDrugInformation] = useState([]);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        const response = await axiosInstance.get("/patients/");
        setPatients(response.data);
    };

    const onSubmit = async (data) => {
        if (editPatient) {
            await axiosInstance.put(`/patients/${editPatient.id}/`, data);
            setEditPatient(null);
        } else {
            await axiosInstance.post("/patients/", data);
        }
        reset();
        fetchPatients();
    };

    const handleEdit = (patient) => {
        setEditPatient(patient);  // Set the current patient for editing
        reset(patient);  // Prefill form fields with the selected patient's data
    };

    const deletePatient = async (id) => {
        await axiosInstance.delete(`/patients/${id}/`);
        fetchPatients();
    };

    // Function to fetch prescriptions by patient ID
    const fetchPrescriptionsByPatientId = async (patientId) => {
        try {
            const response = await axiosInstance.get(`/prescriptions/patient/${patientId}/`);
            
            // Collect all promises for fetching drug information by prescription ID
            const drugInfoPromises = response.data.map(async (element) => {
                const df_response = await getDrugInformationByPrescriptionId(element.id);
                return df_response;
            });
            
            // Wait for all the promises to resolve
            const drugInformationResults = await Promise.all(drugInfoPromises);
            
            // Flatten the array if necessary (since df_response could return arrays)
            const drugInformation = drugInformationResults.flat();
            
            // Now update both states
            setPrescriptions(response.data); // Assuming response is an array of prescriptions
            setDrugInformation(drugInformation);  // Now properly populated
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
        }
    };

    const getDrugInformationByPrescriptionId = async (prescriptionId) => {
        try {
            const response = await axiosInstance.get(`/druginformation/prescription/${prescriptionId}/`);
            return response.data;  // Assumes that response.data is an array of drug information
        } catch (error) {
            console.error("Error fetching drug information:", error);
            return [];  // Return an empty array in case of an error
        }
    };

    const handlePatientChange = (patientId) => {
        setSelectedPatientId(patientId);
        if (patientId) {
            fetchPrescriptionsByPatientId(patientId); // Fetch prescriptions when a patient is selected
        } else {
            setPrescriptions([]); // Reset if no patient is selected
        }
    };

    const handleDownloadPrescription = (prescriptionId) => {
        const link = document.createElement("a");
        link.href = `http://localhost:8000/prescriptions/image/${prescriptionId}/`;
        link.setAttribute("download", true);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
    };

    return (
        <div className="container">
            <h1 className="mt-4">Electronic Prescription Processing System</h1>
            <h2 className="mt-4">Manage Patients</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <b>Name: </b>
                    <input
                        type="text"
                        {...register("name", { required: 'Name is required' })}  // Updated syntax
                    />
                    {errors?.name && <p className="error">{errors.name.message}</p>}
                </div>

                <div className="form-group">
                    <b>Age: </b>
                    <input
                        type="number"
                        {...register("age", { required: 'Age is required' })}  // Updated syntax
                    />
                    {errors?.age && <p className="error">{errors.age.message}</p>}
                </div>

                <div className="form-group">
                    <b>Address: </b>
                    <input
                        type="text"
                        {...register("address", { required: 'Address is required' })}  // Updated syntax
                    />
                    {errors?.address && <p className="error">{errors.address.message}</p>}
                </div>

                <div className="form-group">
                    <b>Phone: </b>
                    <input
                        type="text"
                        {...register("phone_number", { required: 'Phone is required' })}  // Updated syntax
                    />
                    {errors?.phone_number && <p className="error">{errors.phone_number.message}</p>}
                </div>

                <div className="form-group">
                    <b>E-Mail: </b>
                    <input
                        type="email"
                        {...register("email", { required: 'E-Mail is required' })}  // Updated syntax
                    />
                    {errors?.email && <p className="error">{errors.email.message}</p>}
                </div>

                <button type="submit" className="btn btn-primary mt-2">
                    {editPatient ? 'Update Patient' : 'Add Patient'}
                </button>
            </form>

            <table className="table table-bordered margin-top-20">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>E-Mail</th>
                        <th>Joined On</th>
                        <th>Patient Actions</th>
                        <th>Prescription Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.length > 0 ? (
                        patients.map((patient) => (
                            <tr key={patient.id}>
                                <td>{patient.id}</td>
                                <td>{patient.name}</td>
                                <td>{patient.age}</td>
                                <td>{patient.address}</td>
                                <td>{patient.phone_number}</td>
                                <td>{patient.email}</td>
                                <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(patient)}
                                        className="btn btn-info btn-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deletePatient(patient.id)}
                                        className="btn btn-danger btn-sm ml-2 margin-left-5"
                                    >
                                        Delete
                                    </button>

                                </td>
                                <td>
                                    <button
                                        onClick={() => handlePatientChange(patient.id)}
                                        className="btn btn-info btn-sm margin-left-5"
                                    >
                                        Show Drug Information
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">No patients found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Table to display prescription images */}
            {selectedPatientId && (
                <div>
                    <h5 className="mt-4">Prescription Images for Patient ID: {selectedPatientId}</h5>
                    {prescriptions.length > 0 && (
                        <table className="table table-bordered margin-top-20">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Prescription Image</th>
                                    <th>Date Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.length > 0 ? (
                                    prescriptions.map((prescription) => (
                                        <tr key={prescription.id}>
                                            <td>{prescription.id}</td>
                                            <td>{prescription.image_url.substring(prescription.image_url.lastIndexOf("/") + 1)}</td>
                                            <td>{new Date(prescription.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleDownloadPrescription(prescription.id, prescription.image_url.substring(prescription.image_url.lastIndexOf("/") + 1))}
                                                    className="btn btn-info btn-sm margin-left-5"
                                                >
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No prescriptions found for this patient.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Table to display prescription images */}
            {selectedPatientId && (
                <div>
                    <h5 className="mt-4">Drug Information for Patient ID: {selectedPatientId}</h5>
                    {drugInformation.length > 0 && (
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
                                {drugInformation.map((drug, idx) => (
                                    <tr key={idx}>
                                        <td>{drug.drug_name}</td>
                                        <td>{drug.dosage || "N/A"}</td>
                                        <td>{drug.strength || "N/A"}</td>
                                        <td>{drug.frequency || "N/A"}</td>
                                        <td>{drug.duration || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default Patient;
