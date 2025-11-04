// src/components/Header.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { user, signOut, loading } = useAuth();

    return (
        <header
            style={{
                backgroundColor: "#333",
                color: "#fff",
                padding: "12px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <h2 style={{ margin: 0 }}>FashionCoordinate</h2>
            <nav style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
                    ホーム
                </Link>
                <Link to="/coordination/1" style={{ color: "#fff", textDecoration: "none" }}>
                    コーディネート
                </Link>

                {!loading && (
                    <>
                        {user ? (
                            <>
                                <span style={{ color: "#ccc" }}>{user.email}</span>
                                <button
                                    onClick={signOut}
                                    style={{
                                        backgroundColor: "#555",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "4px 8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    ログアウト
                                </button>
                            </>
                        ) : (
                            <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
                                ログイン
                            </Link>
                        )}
                    </>
                )}
            </nav>
        </header>
    );
}
