import React, { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import "./SearchBar.css";

const SearchBar = ({
  isCollapsed,
  setIsCollapsed,
  searchTerm,
  setSearchTerm,
}) => {
  const inputRef = useRef(null);

  // Ctrl + F shortcut
  useHotkeys(
    ["ctrl+f"],
    (e) => {
      e.preventDefault();
      if (isCollapsed) {
        setIsCollapsed(false);
        setTimeout(() => inputRef.current?.focus(), 300);
      } else {
        inputRef.current?.focus();
      }
    },
    [isCollapsed]
  );

  return (
    <>
      {!isCollapsed && (
        <div className="search-container mx-1 mt-2 position-relative">
          <input
            ref={inputRef}
            type="text"
            className="form-control search-input ps-5"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search search-icon position-absolute"></i>
        </div>
      )}
    </>
  );
};

export default SearchBar;
