// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "../pages/Home"
import Login from "../pages/Login"
import SignUpForm from "../pages/SignUpForm"
import Coordination from "../pages/Coordination"
import Dashboard from "../pages/Dashboard"
import OutfitFormPage from "../pages/OutfitFormPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/coordination/:id" element={<Coordination />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/outfit-form" element={<OutfitFormPage />} />
            </Routes>
        </BrowserRouter>
    )
}