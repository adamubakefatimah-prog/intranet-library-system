import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import LibrarianDashboard from "./pages/librarian/LibrarianDashboard";
import AddMaterial from "./pages/AddMaterial";
import EditMaterial from "./pages/EditMaterial";
import ViewMaterial from "./pages/ViewMaterial";
import RegisterLibrarian from "./pages/LibrarianRegister";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import UserDashboard from "./pages/user/UserDashboard";
import UserTransactions from "./pages/transactions/UserTransactions";
import LibrarianTransactions from "./pages/transactions/LibrarianTransactions";
import { ToastContainer } from "react-toastify";
import AuditLog from "./pages/audit/AuditLog";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <Routes>
        <Route path="/" element={<Layout title="Home"><Home /></Layout>} />
        <Route path="/search" element={<Layout title="Search"><Search /></Layout>} />
        <Route path="/LibrarianTransactions" element={<Layout title="Librarian Transactions"><LibrarianTransactions /></Layout>} />
        <Route path="/LibrarianDashboard" element={<Layout title="Librarian Dashboard"><LibrarianDashboard /></Layout>} />
        <Route path="/audit-log" element={<Layout title="Audit Log"><AuditLog /></Layout>} />
        <Route path="/UserTransactions" element={<Layout title="Transaction"><UserTransactions /></Layout>} />
        <Route path="/UserDashboard" element={<Layout title="User Dashboard"><UserDashboard /></Layout>} />
        <Route path="/add-material" element={<Layout title="Add Material"><AddMaterial /></Layout>} />
        <Route path="/edit-material/:id" element={<Layout title="Edit Material"><EditMaterial /></Layout>} />
        <Route path="/view-material/:id" element={<Layout title="View Material"><ViewMaterial /></Layout>} />
        <Route path="/register-librarian" element={<Layout title="Register Librarian"><RegisterLibrarian /></Layout>} />
        <Route path="/login" element={<Layout title="Login"><Login /></Layout>} />
        <Route path="/register" element={<Layout title="Register"><Register /></Layout>} />
        <Route path="*" element={<Layout title="Not Found"><NotFound /></Layout>} />
      </Routes>
    </>
  );
}

export default App;
