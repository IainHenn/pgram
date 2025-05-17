"use client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import SignupComponent from "./SignupComponent";
export default function Home() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<LoginComponent/>}/>
        <Route path="/signup" element={<SignupComponent/>}/>
    </Routes>
    </BrowserRouter>
  )
}