import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand bg-white border-bottom px-4 py-2 sticky-top">
      <div className="container-fluid p-0">
        <span className="navbar-text text-secondary small fw-medium">
          <i className="bi bi-shield-check text-success me-1"></i>
          Item &amp; Purchase Management System &bull; Production Mode
        </span>

        <div className="d-flex align-items-center gap-3 ms-auto">
          <Link to="/purchases/new" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
            <i className="bi bi-cart-plus"></i>
            <span>New Purchase</span>
          </Link>
          <Link to="/items/new" className="btn btn-sm btn-primary d-flex align-items-center gap-1">
            <i className="bi bi-plus-lg"></i>
            <span>Add Item</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
