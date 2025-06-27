"use client";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import SignupComponent from "./SignupComponent";
import DashboardComponent from "./DashboardComponent";
import DrawComponent from "./DrawComponent";
import ProfileComponent from "./ProfileComponent";
import VerifyEmailComponent from "./VerifyEmailComponent";
import PasswordResetComponent from "./PasswordResetComponent";

export default function Home() {
  return (
    <HashRouter>
    <Routes>
      <Route path="/" element={<LoginComponent/>}/>
      <Route path="/signup" element={<SignupComponent/>}/>
      <Route path="/dashboard" element={<DashboardComponent/>}/>
      <Route path="/draw" element={<DrawComponent/>}/>
      <Route path="/profile" element={<ProfileComponent/>}/>
      <Route path="/verify" element={<VerifyEmailComponent/>}/>
      <Route path="/password-reset" element={<PasswordResetComponent/>}/>
    </Routes>
    </HashRouter>
  )
}