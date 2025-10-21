import { Link } from "react-router-dom"

export default function Header() {
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
            <nav style={{ display: "flex", gap: "16px" }}>
                <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
                    ホーム
                </Link>
                <Link to="/coordination/1" style={{ color: "#fff", textDecoration: "none" }}>
                    コーディネート
                </Link>
                <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
                    ログイン
                </Link>
            </nav>
        </header>
    )
}