import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/items', label: 'Item Master', icon: 'bi-box-seam' },
    { to: '/items/new', label: 'Add Item', icon: 'bi-plus-circle' },
    { to: '/item-types', label: 'Item Types', icon: 'bi-tags' },
    { to: '/purchases', label: 'Purchase History', icon: 'bi-clock-history' },
    { to: '/purchases/new', label: 'Create Purchase', icon: 'bi-cart-plus' },
    { to: '/stock', label: 'Stock Availability', icon: 'bi-bar-chart-steps' },
    { to: '/sql-joins', label: 'SQL JOIN Demo', icon: 'bi-database-check' },
  ];

  return (
    <aside className="bg-white border-end d-flex flex-column" style={{ width: '260px', minHeight: '100vh' }}>
      <div className="p-3 border-bottom d-flex align-items-center gap-2">
        <div className="bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
          <i className="bi bi-boxes fs-5"></i>
        </div>
        <div>
          <h6 className="mb-0 fw-bold text-dark" style={{ letterSpacing: '-0.3px' }}>Item &amp; Purchase</h6>
          <small className="text-muted" style={{ fontSize: '0.75rem' }}>Inventory System</small>
        </div>
      </div>

      <div className="p-3 flex-grow-1">
        <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
          Navigation
        </div>
        <ul className="nav nav-pills flex-column gap-1">
          {navItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${
                    isActive ? 'bg-primary text-white shadow-sm fw-medium' : 'text-secondary hover-bg-light'
                  }`
                }
              >
                <i className={`bi ${item.icon} fs-6`}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 border-top bg-light">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success rounded-pill p-1"></span>
          <span className="small text-muted">Backend: Django + MySQL</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
