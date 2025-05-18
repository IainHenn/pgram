"use client";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import SignupComponent from "./SignupComponent";
import DashboardComponent from "./DashboardComponent";
export default function Home() {
  return (
    <HashRouter>
    <Routes>
        <Route path="/" element={<LoginComponent/>}/>
        <Route path="/signup" element={<SignupComponent/>}/>
        <Route path="/dashboard" element={<DashboardComponent/>}/>
    </Routes>
    </HashRouter>
  )
}