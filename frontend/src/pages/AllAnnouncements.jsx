import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";

const AllAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    API.get("/announcements").then((res) => setAnnouncements(res.data));
  }, []);

  return (
    <Layout title="All Announcements">
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h2>📢 All Announcements</h2>
        {announcements.map((a) => (
          <div key={a._id} style={{ padding: "15px", borderBottom: "1px solid #ddd", marginBottom: "10px" }}>
            <h3 style={{ margin: "0 0 5px 0" }}>{a.title}</h3>
            <p style={{ margin: 0 }}>{a.message}</p>
            <small style={{ color: "#666" }}>{new Date(a.date).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AllAnnouncements;