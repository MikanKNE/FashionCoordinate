// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ItemListPage from "../pages/ItemListPage";
import ItemFormPage from "../pages/ItemFormPage";
import Login from "../pages/Login";
import SignUpForm from "../pages/SignUpForm";
import Coordination from "../pages/CoordinationAddPage";
import Dashboard from "../pages/Dashboard";
import OutfitFormPage from "../pages/OutfitFormPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/coordination" element={<Coordination />} />
                <Route path="/item-list" element={<ItemListPage />} />
                <Route path="/item-form" element={<ItemFormPage />} />
                <Route path="/item-form/:id" element={<ItemFormPage />} />
                <Route path="/outfit-form" element={<OutfitFormPage />} />
            </Routes>
        </BrowserRouter>
    );
}
