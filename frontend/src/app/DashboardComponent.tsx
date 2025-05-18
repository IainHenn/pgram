import React from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { error } from 'console';

function DashboardComponent(){
    
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/api/me", {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if(!resp.ok){
                console.log("bruh");
                throw new Error("User not authenticated!");
            }
            return resp.json()
        })
        .catch((error) => {
            navigate('/');
        })
    }, [navigate]);

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