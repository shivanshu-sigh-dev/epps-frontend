import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from './components/Sidebar';
import Patient from './components/Patient';
import Home from './components/Home';
import Prescription from './components/Prescription';

function App() {
	return (
		<Router>
			<div className="App">
				<Sidebar />
				<div className="content" style={{ marginLeft: '220px', padding: '20px' }}>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/patients" element={<Patient />} />
						<Route path="/prescriptions" element={<Prescription />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App;
