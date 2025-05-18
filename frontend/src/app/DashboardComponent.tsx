import React from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { useState, useEffect } from 'react';

function DashboardComponent(){

    return (
        <>
            <nav className="bg-gray-500 text-white p-4 flex items-center justify-between">
            <div className="text-xl text-gray-800 font-bold">Pictogram</div>
            <div className="space-x-4 hidden md:flex">
                <Link to="/dashboard" className="text-gray-800 hover:underline">Home</Link>
            </div>
            </nav>
            <div className="bg-white min-h-screen">
            </div>
        </>
    );  
};

export default DashboardComponent;