"use client";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import SignupComponent from "./SignupComponent";
import DashboardComponent from "./DashboardComponent";
import DrawComponent from "./DrawComponent.tsx";
import ProfileComponent from "./ProfileComponent";

export default function Home() {
  return (
    <HashRouter>
    <Routes>
        <Route path="/" element={<LoginComponent/>}/>
        <Route path="/signup" element={<SignupComponent/>}/>
        <Route path="/dashboard" element={<DashboardComponent/>}/>
        <Route path="/draw" element={<DrawComponent/>}/>
        <Route path="/profile" element={<ProfileComponent/>}/>
    </Routes>
    </HashRouter>
  )
}