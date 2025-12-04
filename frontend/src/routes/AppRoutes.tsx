// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import SignUpForm from "../pages/SignUpForm";
import UserProfilePage from "../pages/UserProfilePage";
import CoordinationListPage from "../pages/CoordinationListPage";
import CoordinationAddPage from "../pages/CoordinationAddPage";
import CoordinationEditPage from "../pages/CoordinationEditPage";
import ItemListPage from "../pages/ItemListPage";
import ItemAddPage from "../pages/ItemAddPage";
import ItemEditPage from "../pages/ItemEditPage";
import OutfitFormPage from "../pages/OutfitFormPage";
import TestUploadPage from "../pages/TestUploadPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/user-profile" element={<UserProfilePage />} />
                <Route path="/coordination-list" element={<CoordinationListPage />} />
                <Route path="/coordination/new" element={<CoordinationAddPage />} />
                <Route path="/coordination/:id/edit" element={<CoordinationEditPage />} />
                <Route path="/item-list" element={<ItemListPage />} />
                <Route path="/items/new" element={<ItemAddPage />} />
                <Route path="/items/:id/edit" element={<ItemEditPage />} />
                <Route path="/outfit-form" element={<OutfitFormPage />} />
                <Route path="/test-upload" element={<TestUploadPage />} />
            </Routes>
        </BrowserRouter>
    );
}
