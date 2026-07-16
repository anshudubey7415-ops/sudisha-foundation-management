import { useNavigate } from "react-router-dom";

const Layout = ({ children, title }) => {
  const navigate = useNavigate();
  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", padding: "15px", borderBottom: "1px solid #ccc" }}>
        <button onClick={() => navigate(-1)}>⬅️ Back</button>
        <h2>{title}</h2>
        <button onClick={() => navigate("/settings")}>⚙️ Settings</button>
      </header>
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
};
export default Layout;