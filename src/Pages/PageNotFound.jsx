import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center"
        }}>
            <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>404</h1>
            <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Oops! Page not found.</p>
            <Link to="/dashboard" style={{ textDecoration: "none", color: "#007bff" }}>Go back to Dashboard</Link>
        </div>
    )
}

export default PageNotFound;