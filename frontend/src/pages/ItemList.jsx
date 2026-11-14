import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsApi, itemTypesApi } from '../services/api';
import { AvailabilityBadge, ActiveBadge } from '../components/StatusBadge';
import AlertMessage from '../components/AlertMessage';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');

  const fetchFiltersAndItems = async () => {
    try {
      setLoading(true);
      const [typesRes, itemsRes] = await Promise.all([
        itemTypesApi.getAll(),
        itemsApi.getAll({
          search: searchTerm,
          item_type: selectedType,
          active: selectedStatus,
          availability: selectedAvailability,
        }),
      ]);
      setItemTypes(typesRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load items. Check server status.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersAndItems();
  }, [searchTerm, selectedType, selectedStatus, selectedAvailability]);

  const handleToggleStatus = async (item) => {
    try {
      const updatedStatus = !item.active;
      await itemsApi.update(item.id, { active: updatedStatus });
      setAlert({
        type: 'success',
        message: `Item "${item.name}" marked as ${updatedStatus ? 'Active' : 'Inactive'}.`,
      });
      // Refresh list
      fetchFiltersAndItems();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update item status.' });
    }
  };

  const handleDelete = async (item) => {
    if (item.is_used_in_purchase) {
      setAlert({
        type: 'warning',
        message: `Deletion Prohibited: Item "${item.name}" has recorded purchase transactions. Under historical audit rules, you cannot delete it. You may deactivate it instead.`,
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete item "${item.name}"?`)) {
      return;
    }

    try {
      await itemsApi.delete(item.id);
      setAlert({ type: 'success', message: `Item "${item.name}" was successfully deleted.` });
      fetchFiltersAndItems();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete item.';
      setAlert({ type: 'danger', message: msg });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedAvailability('');
  };

  return (
    <div className="container-fluid p-4">
      {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">Item Master</h4>
          <p className="text-muted small mb-0">View, search, filter, and manage items in the inventory catalogue.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/items/new" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-plus-lg"></i> Add New Item
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Search */}
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div className="col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Categories</option>
                {itemTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>

            {/* Filter by Stock Availability */}
            <div className="col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                <option value="">All Availability</option>
                <option value="in_stock">In Stock (&gt; 5)</option>
                <option value="low_stock">Low Stock (&le; 5)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>
            </div>

            {/* Reset */}
            <div className="col-sm-6 col-md-1 text-end">
              <button
                onClick={handleResetFilters}
                className="btn btn-sm btn-outline-secondary w-100"
                title="Reset filters"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            <i className="bi bi-box-seam me-2 text-primary"></i>
            Items ({items.length})
          </h6>
          <span className="small text-muted">Joined via SQL with item_types</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small">
                <th style={{ width: '70px' }}>Item ID</th>
                <th>Item Name</th>
                <th>Item Type</th>
                <th>Purchase Date</th>
                <th className="text-center">Current Stock</th>
                <th>Availability</th>
                <th>Status</th>
                <th className="text-end" style={{ width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading items from database...
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="small text-muted">#{item.id}</td>
                    <td>
                      <Link to={`/items/${item.id}`} className="fw-semibold text-dark text-decoration-none">
                        {item.name}
                      </Link>
                      {item.is_used_in_purchase && (
                        <span className="badge bg-light text-muted border ms-2 small" title="Used in purchase orders">
                          In History
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                        {item.type_name}
                      </span>
                    </td>
                    <td className="small text-muted">{item.purchase_date}</td>
                    <td className="text-center fw-bold">
                      <span className={item.stock_available === 0 ? 'text-danger' : item.stock_available <= 5 ? 'text-warning-emphasis' : 'text-success'}>
                        {item.stock_available}
                      </span>
                    </td>
                    <td>
                      <AvailabilityBadge availability={item.availability} />
                    </td>
                    <td>
                      <ActiveBadge active={item.active} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/items/${item.id}`}
                          className="btn btn-outline-secondary py-1 px-2"
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <Link
                          to={`/items/${item.id}/edit`}
                          className="btn btn-outline-secondary py-1 px-2"
                          title="Edit Item"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`btn ${item.active ? 'btn-outline-warning' : 'btn-outline-success'} py-1 px-2`}
                          title={item.active ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`bi ${item.active ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn btn-outline-danger py-1 px-2"
                          title={item.is_used_in_purchase ? 'Protected: cannot delete items with purchase history' : 'Delete Item'}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted small">
                    <i className="bi bi-inbox fs-3 d-block text-secondary mb-2"></i>
                    No items match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemList;
