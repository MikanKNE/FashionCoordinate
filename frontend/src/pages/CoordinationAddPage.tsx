// frontend/src/pages/CoordinationAddPage.tsx
import React from "react";

import Header from "../components/Header";
import CoordinationEditor from "../components/CoordinationEditor";

export default function CoordinationAddPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen p-6 text-slate-800 dark:text-slate-100">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">コーディネート登録</h1>
          <CoordinationEditor />
        </div>
      </div>
    </>
  );
}
