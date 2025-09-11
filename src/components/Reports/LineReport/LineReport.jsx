import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import './LineReport.css';

const LineReport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.warning('Please enter a line number');
      return;
    }

    try {
      const response = await api.get(`/api/line/report/${searchQuery}`);
      if (response.data && response.data.status) {
        setResults(response.data.data || []);
      } else {
        setResults([]);
        toast.error('No data found for the given line');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data. Please try again');
      setResults([]);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setResults([]);
  };

  return (
    <div>
      {/* Header Section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Line Report</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{' '}
              <span className="ms-1 mt-1 text-small-gray">/ Line Report</span>
            </p>
          </div>
        </div>
      </nav>

      {/* Search Section */}
      <div className="search-filter-container mx-2 mt-4">
        <div className="search-box text-8 d-flex">
          <div className="position-relative flex-grow-1">
            <i className="fas fa-search position-absolute z-0 input-icon"></i>
            <input
              type="text"
              className="form-control vendor-search-bar"
              placeholder="Enter line number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <button className="btn btn-primary ms-2" onClick={handleSearch}>
            <i className="fas fa-search me-2"></i>Search
          </button>
          <button className="btn btn-secondary ms-2" onClick={handleReset}>
            <i className="fas fa-undo me-2"></i>Reset
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="margin-2 mx-2 mt-4">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Line Number</th>
                <th>Shift</th>
                <th>Production Target</th>
                <th>Actual Production</th>
                <th>Efficiency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {results.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="7" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-industry no-data-icon"></i>
                      <p className="no-data-text">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                results.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-4">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="ps-4">{item.lineNumber}</td>
                    <td className="ps-4">{item.shift}</td>
                    <td className="ps-4">{item.productionTarget}</td>
                    <td className="ps-4">{item.actualProduction}</td>
                    <td className="ps-4">{item.efficiency}%</td>
                    <td className="ps-4">{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LineReport;
