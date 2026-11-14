import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { itemsApi, itemTypesApi } from '../services/api';
import AlertMessage from '../components/AlertMessage';

const ItemForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [itemTypes, setItemTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    item_type_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    stock_available: 0,
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const typesRes = await itemTypesApi.getAll();
        setItemTypes(typesRes.data);

        if (isEditMode) {
          const itemRes = await itemsApi.getById(id);
          const item = itemRes.data;
          setFormData({
            name: item.name,
            item_type_id: item.item_type?.id || '',
            purchase_date: item.purchase_date,
            stock_available: item.stock_available,
            active: item.active,
          });
        }
      } catch (err) {
        setAlert({ type: 'danger', message: 'Failed to load item or item types data.' });
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (!formData.name.trim()) {
      setAlert({ type: 'warning', message: 'Item name is required.' });
      return;
    }
    if (!formData.item_type_id) {
      setAlert({ type: 'warning', message: 'Item type must be selected.' });
      return;
    }
    if (!formData.purchase_date) {
      setAlert({ type: 'warning', message: 'Purchase date is required.' });
      return;
    }
    if (Number(formData.stock_available) < 0) {
      setAlert({ type: 'warning', message: 'Stock available cannot be negative.' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        item_type_id: Number(formData.item_type_id),
        purchase_date: formData.purchase_date,
        stock_available: Number(formData.stock_available),
        active: Boolean(formData.active),
      };

      if (isEditMode) {
        await itemsApi.update(id, payload);
      } else {
        await itemsApi.create(payload);
      }

      navigate('/items');
    } catch (err) {
      const msg = err.response?.data || 'Failed to save item. Check backend logs.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-3 text-muted">Loading item details...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '800px' }}>
      {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">{isEditMode ? 'Edit Item' : 'Add New Item'}</h4>
          <p className="text-muted small mb-0">
            {isEditMode ? 'Modify item specifications and stock levels.' : 'Register a new product in the inventory master catalogue.'}
          </p>
        </div>
        <Link to="/items" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> Back to Items
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-bottom py-3">
          <h6 className="fw-bold mb-0 text-dark">
            <i className={`bi ${isEditMode ? 'bi-pencil text-warning' : 'bi-plus-circle text-primary'} me-2`}></i>
            Item Information
          </h6>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Item Name */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label small fw-semibold text-secondary">
                Item Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="e.g. Dell XPS Laptop, Logitech Wireless Mouse"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Item Type */}
            <div className="mb-3">
              <label htmlFor="item_type_id" className="form-label small fw-semibold text-secondary">
                Item Type / Category <span className="text-danger">*</span>
              </label>
              <select
                id="item_type_id"
                name="item_type_id"
                className="form-select"
                value={formData.item_type_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Item Category --</option>
                {itemTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
              <div className="form-text small">
                Don't see your category? <Link to="/item-types">Manage Item Types here</Link>.
              </div>
            </div>

            {/* Purchase Date & Initial Stock */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="purchase_date" className="form-label small fw-semibold text-secondary">
                  Purchase Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  className="form-control"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="stock_available" className="form-label small fw-semibold text-secondary">
                  Stock Available <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="stock_available"
                  name="stock_available"
                  className="form-control"
                  min="0"
                  step="1"
                  value={formData.stock_available}
                  onChange={handleChange}
                  required
                />
                <div className="form-text small">Cannot be negative. Stock &le; 5 will be marked as Low Stock.</div>
              </div>
            </div>

            {/* Active / Inactive Status */}
            <div className="mb-4 pt-2">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-semibold text-secondary" htmlFor="active">
                  {formData.active ? (
                    <span className="text-success"><i className="bi bi-check-circle me-1"></i>Active (Available for new purchase orders)</span>
                  ) : (
                    <span className="text-secondary"><i className="bi bi-pause-circle me-1"></i>Inactive (Hidden from new purchase orders)</span>
                  )}
                </label>
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="d-flex justify-content-end gap-2 pt-2 border-top">
              <Link to="/items" className="btn btn-outline-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Saving...
                  </>
                ) : (
                  isEditMode ? 'Update Item' : 'Create Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;
