// frontend/src/pages/TestUploadPage.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";

export default function TestUploadPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string>("");

    const handleUpload = async () => {
        if (!imageFile) {
            toast.error("画像を選択してください");
            return;
        }

        const formData = new FormData();
        formData.append("image", imageFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/test-upload/", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.status === "success") {
                setUploadedUrl(data.url);
                toast.success("アップロード成功！");
            } else {
                toast.error(data.message || "アップロード失敗");
            }
        } catch (err) {
            console.error(err);
            toast.error("アップロード中にエラーが発生しました");
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen flex flex-col items-center p-6">
                <h1 className="text-2xl font-bold mb-4">画像アップロードテスト</h1>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="mb-4"
                />

                <button
                    onClick={handleUpload}
                    className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
                >
                    アップロード
                </button>

                {uploadedUrl && (
                    <div className="mt-4 flex flex-col items-center">
                        <p className="mb-2">アップロードされた画像:</p>
                        <img src={uploadedUrl} alt="uploaded" className="w-40 h-40 object-cover rounded" />
                        <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600">
                            画像リンクを開く
                        </a>
                    </div>
                )}
            </div>
        </>
    );
}
