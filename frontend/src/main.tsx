// frontend/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="w-full min-h-screen flex flex-col">
      <AuthProvider>
        <App />
        <Toaster position="top-center" reverseOrder={false} />
      </AuthProvider>
    </div>
  </StrictMode>
);
