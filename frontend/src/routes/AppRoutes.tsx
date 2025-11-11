// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ItemListPage from "../pages/ItemListPage"
import Login from "../pages/Login"
import SignUpForm from "../pages/SignUpForm"
import Coordination from "../pages/Coordination"
import Dashboard from "../pages/Dashboard"
import OutfitFormPage from "../pages/OutfitFormPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/coordination/:id" element={<Coordination />} />
                <Route path="/item-list" element={<ItemListPage />} />
                <Route path="/outfit-form" element={<OutfitFormPage />} />
            </Routes>
        </BrowserRouter>
    )
}