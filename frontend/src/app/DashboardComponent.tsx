import React from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { error } from 'console';

function DashboardComponent(){
    
    const navigate = useNavigate();

    const sendToDraw = () => {
        navigate('/draw');
    }

    function signOut(){
        fetch("http://localhost:8080/api/logout", {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if(!resp.ok){
                throw new Error("Failed to signout!");
            }
            navigate("/");
        })
        .catch((error) => {
            alert(`Error! ${error}`);
        })
    }

    //Checking for user authentication, otherwise redirect them to login page
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
            <nav className="bg-gray-300 text-white p-4 flex items-center justify-between">
                <div className="space-x-4 hidden md:flex">
                    <Link to="/dashboard" className="text-gray-800 font-bold">Pictogram</Link>
                </div>
            <button className='bg-blue-300 text-black px-4 py-2 rounded hover:bg-blue-800' onClick={sendToDraw}>Draw</button>
            <button className="bg-blue-300 text-black px-4 py-2 rounded hover:bg-red-600" onClick={signOut}>Sign Out</button>
            </nav>
            <div className="bg-white min-h-screen">
            </div>
        </>
    );  
};

export default DashboardComponent;