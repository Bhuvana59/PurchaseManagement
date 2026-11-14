import React, { useState, useEffect } from 'react';
import { itemTypesApi } from '../services/api';
import AlertMessage from '../components/AlertMessage';

const ItemTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Form states
  const [typeName, setTypeName] = useState('');
  const [editingType, setEditingType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItemTypes = async () => {
    try {
      setLoading(true);
      const res = await itemTypesApi.getAll();
      setTypes(res.data);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load item types.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeName.trim()) {
      setAlert({ type: 'warning', message: 'Item type name cannot be blank.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingType) {
        await itemTypesApi.update(editingType.id, { type_name: typeName.trim() });
        setAlert({ type: 'success', message: `Item type updated to "${typeName.trim()}".` });
      } else {
        await itemTypesApi.create({ type_name: typeName.trim() });
        setAlert({ type: 'success', message: `Item type "${typeName.trim()}" created successfully.` });
      }
      setTypeName('');
      setEditingType(null);
      fetchItemTypes();
    } catch (err) {
      const msg = err.response?.data?.type_name || err.response?.data?.error || 'Operation failed.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (itemType) => {
    setEditingType(itemType);
    setTypeName(itemType.type_name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingType(null);
    setTypeName('');
  };

  const handleDelete = async (itemType) => {
    if (!window.confirm(`Are you sure you want to delete "${itemType.type_name}"?`)) {
      return;
    }

    try {
      await itemTypesApi.delete(itemType.id);
      setAlert({ type: 'success', message: `Item type "${itemType.type_name}" deleted.` });
      fetchItemTypes();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete item type.';
      setAlert({ type: 'danger', message: msg });
    }
  };

  return (
    <div className="container-fluid p-4">
      {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="mb-4">
        <h4 className="fw-bold mb-1">Item Type Management</h4>
        <p className="text-muted small mb-0">Create and manage item categories. Deletion is restricted if items exist.</p>
      </div>

      <div className="row g-4">
        {/* Left Form Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className={`bi ${editingType ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-primary'} me-2`}></i>
                {editingType ? 'Edit Item Type' : 'Add New Item Type'}
              </h6>
            </div>
            <div className="card-body p-3">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="typeName" className="form-label small fw-semibold text-secondary">
                    Item Type Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="typeName"
                    className="form-control form-control-sm"
                    placeholder="e.g. Electronics, Furniture..."
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    required
                  />
                  <div className="form-text small">Names must be unique and descriptive.</div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-sm btn-primary flex-grow-1" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      editingType ? 'Update Type' : 'Create Type'
                    )}
                  </button>
                  {editingType && (
                    <button type="button" onClick={handleCancelEdit} className="btn btn-sm btn-outline-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right List Card */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-tags me-2 text-primary"></i>All Item Types ({types.length})
              </h6>
              <button onClick={fetchItemTypes} className="btn btn-sm btn-outline-secondary py-1 px-2">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-muted small">
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Type Name</th>
                    <th className="text-center" style={{ width: '130px' }}>Items Linked</th>
                    <th className="text-end" style={{ width: '140px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                        Loading categories...
                      </td>
                    </tr>
                  ) : types.length > 0 ? (
                    types.map((type) => (
                      <tr key={type.id}>
                        <td className="text-muted small">#{type.id}</td>
                        <td className="fw-medium text-dark">{type.type_name}</td>
                        <td className="text-center">
                          <span className={`badge ${type.items_count > 0 ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-light text-muted border'}`}>
                            {type.items_count} item{type.items_count === 1 ? '' : 's'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleEditClick(type)}
                            className="btn btn-sm btn-outline-secondary py-1 px-2 me-1"
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(type)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            title={type.items_count > 0 ? "Cannot delete: items are linked" : "Delete"}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted small">
                        No item types found. Add your first category on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemTypes;
