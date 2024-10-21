import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    return (
        <div className="sidebar">
            <h2 className='align-left'>Site Navigation</h2>
            <ul>
                <li className={location.pathname === '/' ? 'align-left active' : 'align-left'}>
                    <Link to="/">Home</Link>
                </li>
                <li className={location.pathname === '/patients' ? 'align-left active' : 'align-left'}>
                    <Link to="/patients">Manage Patients</Link>
                </li>
                <li className={location.pathname === '/prescriptions' ? 'align-left active' : 'align-left'}>
                    <Link to="/prescriptions">Manage Prescriptions</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
