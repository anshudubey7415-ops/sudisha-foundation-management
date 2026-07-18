import { useNavigate } from "react-router-dom";

const Layout = ({ children, title }) => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "15px 25px", 
        background: "white",
        borderBottom: "1px solid #e2e8f0" 
      }}>
        {/* Back button logic: check if history exists */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: "8px 15px", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          ⬅️ Back
        </button>
        
        <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1e3a8a" }}>{title}</h2>
        
        <button 
          onClick={() => navigate("/settings")} 
          style={{ padding: "8px 15px", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          ⚙️ Settings
        </button>
      </header>
      
      <main style={{ padding: "20px" }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;