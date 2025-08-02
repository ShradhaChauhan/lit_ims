// components/MainLayout.js
import SideBar from "../SideBar/SideBar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

export default function MainLayout() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container-fluid min-vh-100 d-flex flex-1 p-0 app-container">
        {/* Sidebar */}
        <div className="d-flex flex-column">
          <SideBar />
        </div>

        {/* Right Side Content */}
        <div className="w-100 d-flex flex-column content-area">
          <div className="right-side-div bg-light flex-grow-1 overflow-auto">
            <Outlet /> {/* 👈 Nested routes will render here */}
          </div>
        </div>
      </div>
    </>
  );
}
