import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { purchasesApi, sqlJoinsApi } from '../services/api';
import { AvailabilityBadge, ActiveBadge } from '../components/StatusBadge';
import AlertMessage from '../components/AlertMessage';

const PurchaseDetails = () => {
  const { id } = useParams();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [sqlDemoData, setSqlDemoData] = useState(null);
  const [showSqlModal, setShowSqlModal] = useState(false);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);
        const res = await purchasesApi.getById(id);
        setPurchase(res.data);
      } catch (err) {
        setAlert({ type: 'danger', message: 'Failed to retrieve purchase details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [id]);

  const handleShowSql = async () => {
    if (!purchase) return;
    try {
      const res = await sqlJoinsApi.getPurchaseJoin(purchase.order_id);
      setSqlDemoData(res.data);
      setShowSqlModal(true);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to fetch SQL JOIN details.' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-3 text-muted">Loading purchase details...</span>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning">Purchase order not found.</div>
        <Link to="/purchases" className="btn btn-outline-secondary btn-sm">Back to Purchase History</Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '960px' }}>
      {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary fs-6 px-3 py-1">{purchase.order_id}</span>
            <span className="badge bg-light text-muted border">ID #{purchase.id}</span>
          </div>
          <h4 className="fw-bold mb-0">Purchase Order Summary</h4>
        </div>
        <div className="d-flex gap-2">
          <Link to="/purchases" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> History
          </Link>
          <button onClick={handleShowSql} className="btn btn-sm btn-outline-info text-dark">
            <i className="bi bi-database me-1"></i> View SQL JOIN
          </button>
          <Link to={`/purchases/${purchase.id}/edit`} className="btn btn-sm btn-primary">
            <i className="bi bi-pencil me-1"></i> Edit Purchase
          </Link>
        </div>
      </div>

      {/* Header Info */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-sm-6 col-md-3">
              <span className="text-muted small">Order ID</span>
              <div className="fw-bold text-dark fs-5">{purchase.order_id}</div>
            </div>
            <div className="col-sm-6 col-md-3">
              <span className="text-muted small">Purchase Date</span>
              <div className="fw-bold text-dark fs-5">{purchase.purchase_date}</div>
            </div>
            <div className="col-sm-6 col-md-3">
              <span className="text-muted small">Distinct Items</span>
              <div className="fw-bold text-dark fs-5">{purchase.total_items} items</div>
            </div>
            <div className="col-sm-6 col-md-3">
              <span className="text-muted small">Total Units Purchased</span>
              <div className="fw-bold text-primary fs-5">{purchase.total_units} units</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            <i className="bi bi-box-seam text-primary me-2"></i>
            Purchased Line Items
          </h6>
          <span className="small text-muted">Retrieved via SQL JOIN from MySQL</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small">
                <th style={{ width: '60px' }}>#</th>
                <th>Item Name</th>
                <th>Item Category</th>
                <th className="text-center">Order Qty</th>
                <th className="text-center">Current Warehouse Stock</th>
                <th>Availability</th>
                <th>Item Status</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items?.map((line, idx) => (
                <tr key={line.id}>
                  <td className="small text-muted">{idx + 1}</td>
                  <td>
                    <Link to={`/items/${line.item_id}`} className="fw-semibold text-dark text-decoration-none">
                      {line.item_name}
                    </Link>
                  </td>
                  <td>
                    <span className="badge bg-secondary-subtle text-secondary border">
                      {line.type_name}
                    </span>
                  </td>
                  <td className="text-center fw-bold text-primary fs-6">{line.quantity}</td>
                  <td className="text-center fw-semibold text-dark">{line.current_stock}</td>
                  <td>
                    <AvailabilityBadge availability={line.availability} />
                  </td>
                  <td>
                    <ActiveBadge active={line.item_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Join Modal */}
      {showSqlModal && sqlDemoData && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h6 className="modal-title fw-bold">
                  <i className="bi bi-database me-2 text-primary"></i>
                  SQL JOIN Query Demonstration
                </h6>
                <button type="button" className="btn-close" onClick={() => setShowSqlModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="small text-muted mb-2">
                  Query executed directly in MySQL to retrieve this purchase order with items and categories:
                </p>
                <pre className="bg-dark text-light p-3 rounded small" style={{ whiteSpace: 'pre-wrap' }}>
                  {sqlDemoData.sql_query}
                </pre>
                <div className="small fw-bold mb-2">Query Results ({sqlDemoData.records.length} records):</div>
                <div className="table-responsive" style={{ maxHeight: '200px' }}>
                  <table className="table table-sm table-bordered small">
                    <thead className="table-light">
                      <tr>
                        <th>order_id</th>
                        <th>purchase_date</th>
                        <th>item_name</th>
                        <th>type_name</th>
                        <th>quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sqlDemoData.records.map((r, i) => (
                        <tr key={i}>
                          <td>{r.order_id}</td>
                          <td>{r.purchase_date}</td>
                          <td>{r.item_name}</td>
                          <td>{r.type_name}</td>
                          <td>{r.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowSqlModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseDetails;
