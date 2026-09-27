import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Layout = ({ children, title, subtitle, actions }) => {
  const navigate = useNavigate();

  return (
    <div className="layout-page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary btn-icon"
              title="Go Back"
              style={{ width: "36px", height: "36px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
        </div>

        {actions && <div className="page-actions">{actions}</div>}
      </div>

      <div className="layout-page-body">
        {children}
      </div>
    </div>
  );
};

export default Layout;