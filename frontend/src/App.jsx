import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MyRequests from "./pages/MyRequests";
import ProtectedRoute from "./routes/ProtectedRoute";
import OwnerRequests from "./pages/OwnerRequests";
import MyItems from "./pages/MyItems";
import Dashboard from "./pages/Dashboard";
import BorrowedItems from "./pages/BorrowedItems";
import Register from "./pages/Register";
import AddItem from "./pages/AddItem";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Borrower */}
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/borrowed"
            element={
              <ProtectedRoute>
                <BorrowedItems />
              </ProtectedRoute>
            }
          />

          {/* Owner */}
          <Route
            path="/incoming-requests"
            element={
              <ProtectedRoute>
                <OwnerRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-items"
            element={
              <ProtectedRoute>
                <MyItems />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-item"
            element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            }
          />

          {/* Common */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
