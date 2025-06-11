import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileComponent: React.FC = () => {
    const navigate = useNavigate();

    // Check if user is signed in
    useEffect(() => {
        fetch("http://localhost:8080/api/me", {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if (!resp.ok) {
                throw new Error("User not authenticated!");
            }
            return resp.json();
        })
        .catch(() => {
            navigate('/');
        });
    }, [navigate]);

    
    useEffect(() => {
        fetch("http://localhost:8080/users/self", {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if (!resp.ok){
                throw new Error("Some error occured");

            }
            return resp.json();
        })
        .then(data => {
            console.log(data);
        })
    }, [])

    return (
        <div className="bg-white min-h-screen">
            <p className="text-black">hi</p>
        </div>
    )
}

export default ProfileComponent;