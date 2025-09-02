import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./StockAdjustment.css";
import { toast } from "react-toastify";

const StockAdjustment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [error, setError] = useState("");

  const scanBathch = async () => {
    console.log("scanning batch:", batchNumber);
    if (!batchNumber.trim()) {
      setError("Batch number is required");
      return;
    }
    try {
      setIsLoading(true);
      await api.post("/api/", batchNumber);
      setError("");
      toast.success("Process done successfully");
      setIsLoading(false);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setError("");
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "all",
          }}
        >
          <div className="orbit-loader">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Stock Adjustment</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Stock Adjustment
              </span>
            </p>
          </div>
        </div>
      </nav>
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{ minHeight: "80vh" }}
      >
        <div
          className="card shadow-lg p-5 rounded-4 fade-in-up"
          style={{ width: "100%", maxWidth: "650px" }}
        >
          <h5 className="text-center mb-4 fw-bold">Stock Adjustment</h5>

          <form>
            <div className="mb-3">
              <label htmlFor="batchInput" className="form-label fw-semibold">
                Scan Batch Number
              </label>
              <div className="position-relative w-100">
                <i
                  className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 input-icon text-8"
                  style={{ pointerEvents: "none" }}
                ></i>
                <input
                  type="text"
                  id="batchInput"
                  className={`form-control text-8 ps-5 ${
                    error ? "is-invalid" : ""
                  }`}
                  placeholder="Scan batch number"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </div>

            <div className="d-grid">
              <button
                type="button"
                className="btn btn-primary text-8 mt-2"
                onClick={() => scanBathch()}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;
