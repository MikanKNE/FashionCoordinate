import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";
import { getUserDetail } from "../api/users";

export default function Header() {
    const { user: authUser, signOut, loading } = useAuth();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        if (!authUser) {
            setCurrentUser(null);
            return;
        }

        // AuthContext の user.id を使って Django API から取得
        getUserDetail(authUser.id)
            .then(res => {
                if (res.status === "success") {
                    setCurrentUser(res.data);
                } else {
                    console.error(res.message);
                }
            })
            .catch(err => console.error(err));
    }, [authUser]);

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
                <Link to="/item-list" style={{ color: "#fff", textDecoration: "none" }}>
                    アイテム一覧
                </Link>
                <Link to="/coordination" style={{ color: "#fff", textDecoration: "none" }}>
                    コーディネート
                </Link>

                {!loading && (
                    <>
                        {currentUser ? (
                            <>
                                {/* display_name を表示 */}
                                <span style={{ color: "#ccc" }}>
                                    {currentUser.display_name + "様" || currentUser.email + "様"}
                                </span>
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
                            <>
                                <span style={{ color: "#ccc" }}>
                                    ゲスト様
                                </span>
                                <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
                                    ログイン
                                </Link>
                            </>
                        )}
                    </>
                )}
            </nav>
        </header>
    );
}
