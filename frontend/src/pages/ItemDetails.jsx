import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemsApi, purchasesApi } from '../services/api';
import { AvailabilityBadge, ActiveBadge } from '../components/StatusBadge';
import AlertMessage from '../components/AlertMessage';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemRes, purchasesRes] = await Promise.all([
        itemsApi.getById(id),
        purchasesApi.getAll(),
      ]);
      setItem(itemRes.data);

      // Filter purchases containing this item
      const related = [];
      for (const p of purchasesRes.data) {
        const line = p.items?.find((pi) => pi.item_id === Number(id));
        if (line) {
          related.push({
            purchase_id: p.id,
            order_id: p.order_id,
            purchase_date: p.purchase_date,
            quantity: line.quantity,
          });
        }
      }
      setPurchaseHistory(related);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load item details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleToggleStatus = async () => {
    try {
      const nextStatus = !item.active;
      await itemsApi.update(item.id, { active: nextStatus });
      setItem({ ...item, active: nextStatus });
      setAlert({
        type: 'success',
        message: `Item status updated to ${nextStatus ? 'Active' : 'Inactive'}.`,
      });
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update item status.' });
    }
  };

  const handleDelete = async () => {
    if (item.is_used_in_purchase) {
      setAlert({
        type: 'warning',
        message: `This item has purchase transactions in order history and cannot be deleted. Deactivate it instead.`,
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete item "${item.name}"?`)) {
      return;
    }

    try {
      await itemsApi.delete(item.id);
      navigate('/items');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete item.';
      setAlert({ type: 'danger', message: msg });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-3 text-muted">Loading item details...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning">Item not found.</div>
        <Link to="/items" className="btn btn-outline-secondary btn-sm">Back to Items</Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '960px' }}>
      {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-secondary-subtle text-secondary border">Item #{item.id}</span>
            <AvailabilityBadge availability={item.availability} />
            <ActiveBadge active={item.active} />
          </div>
          <h4 className="fw-bold mb-0">{item.name}</h4>
        </div>
        <div className="d-flex gap-2">
          <Link to="/items" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Back to Items
          </Link>
          <Link to={`/items/${item.id}/edit`} className="btn btn-sm btn-outline-primary">
            <i className="bi bi-pencil me-1"></i> Edit
          </Link>
          <button
            onClick={handleToggleStatus}
            className={`btn btn-sm ${item.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
          >
            <i className={`bi ${item.active ? 'bi-pause-circle' : 'bi-play-circle'} me-1`}></i>
            {item.active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-sm btn-outline-danger"
            disabled={item.is_used_in_purchase}
            title={item.is_used_in_purchase ? 'Protected: in purchase history' : 'Delete'}
          >
            <i className="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      </div>

      {/* Item Information Card */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-info-circle text-primary me-2"></i>Item Specifications
              </h6>
            </div>
            <div className="card-body p-3">
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted small" style={{ width: '140px' }}>Item ID:</td>
                    <td className="fw-semibold">#{item.id}</td>
                  </tr>
                  <tr>
                    <td className="text-muted small">Item Name:</td>
                    <td className="fw-semibold">{item.name}</td>
                  </tr>
                  <tr>
                    <td className="text-muted small">Item Type:</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        {item.type_name}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted small">Purchase Date:</td>
                    <td>{item.purchase_date}</td>
                  </tr>
                  <tr>
                    <td className="text-muted small">Active Status:</td>
                    <td>
                      <ActiveBadge active={item.active} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-boxes text-success me-2"></i>Inventory &amp; Stock Levels
              </h6>
            </div>
            <div className="card-body p-3">
              <div className="p-3 bg-light rounded-3 mb-3 text-center">
                <div className="text-muted small">Current Available Stock</div>
                <div className="display-6 fw-bold my-1 text-primary">{item.stock_available}</div>
                <div className="mt-1">
                  <AvailabilityBadge availability={item.availability} />
                </div>
              </div>

              <div className="small text-muted">
                {item.stock_available === 0 && (
                  <div className="text-danger">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    This item is out of stock and cannot be purchased currently.
                  </div>
                )}
                {item.stock_available > 0 && item.stock_available <= 5 && (
                  <div className="text-warning-emphasis">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Stock level is low (&le; 5 units remaining).
                  </div>
                )}
                {item.stock_available > 5 && (
                  <div className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Stock level is healthy and sufficient.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Purchase History */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            <i className="bi bi-receipt text-primary me-2"></i>Purchase Order History ({purchaseHistory.length})
          </h6>
          {purchaseHistory.length > 0 && (
            <span className="badge bg-light text-muted border">
              Total Units Purchased: {purchaseHistory.reduce((acc, curr) => acc + curr.quantity, 0)}
            </span>
          )}
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small">
                <th>Order ID</th>
                <th>Purchase Date</th>
                <th className="text-center">Quantity Purchased</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.length > 0 ? (
                purchaseHistory.map((ph) => (
                  <tr key={ph.purchase_id}>
                    <td>
                      <Link to={`/purchases/${ph.purchase_id}`} className="fw-semibold text-primary text-decoration-none">
                        {ph.order_id}
                      </Link>
                    </td>
                    <td className="small text-muted">{ph.purchase_date}</td>
                    <td className="text-center fw-bold">{ph.quantity}</td>
                    <td className="text-end">
                      <Link to={`/purchases/${ph.purchase_id}`} className="btn btn-sm btn-outline-secondary py-0 px-2">
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    No purchases have included this item yet.
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

export default ItemDetails;
