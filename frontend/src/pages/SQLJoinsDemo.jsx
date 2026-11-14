import React, { useState, useEffect } from 'react';
import { sqlJoinsApi, purchasesApi } from '../services/api';
import AlertMessage from '../components/AlertMessage';

const SQLJoinsDemo = () => {
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'purchase'
  const [itemsJoinData, setItemsJoinData] = useState(null);
  const [purchaseJoinData, setPurchaseJoinData] = useState(null);
  const [purchasesList, setPurchasesList] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('PO-00001');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const res = await purchasesApi.getAll();
        setPurchasesList(res.data);
        if (res.data.length > 0) {
          setSelectedOrderId(res.data[0].order_id);
        }
      } catch (err) {
        // silent
      }
    };
    loadPurchases();
    fetchItemsJoin();
  }, []);

  const fetchItemsJoin = async () => {
    try {
      setLoading(true);
      const res = await sqlJoinsApi.getItemsJoin();
      setItemsJoinData(res.data);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to execute Items SQL JOIN query.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseJoin = async (orderIdToFetch) => {
    const oId = orderIdToFetch || selectedOrderId;
    if (!oId) return;

    try {
      setLoading(true);
      const res = await sqlJoinsApi.getPurchaseJoin(oId);
      setPurchaseJoinData(res.data);
    } catch (err) {
      setAlert({ type: 'danger', message: `Failed to execute Purchase SQL JOIN query for order ${oId}.` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'purchase' && selectedOrderId) {
      fetchPurchaseJoin(selectedOrderId);
    }
  }, [activeTab, selectedOrderId]);

  return (
    <div className="container-fluid p-4">
      {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="mb-4">
        <h4 className="fw-bold mb-1">SQL JOIN Requirement Demonstration</h4>
        <p className="text-muted small mb-0">
          Live verification of multi-table relational SQL JOIN queries executed directly against MySQL.
        </p>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'items' ? 'active' : 'bg-light text-secondary'}`}
            onClick={() => setActiveTab('items')}
          >
            <i className="bi bi-box-seam me-1"></i> 1. Item + Item Type JOIN
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'purchase' ? 'active' : 'bg-light text-secondary'}`}
            onClick={() => setActiveTab('purchase')}
          >
            <i className="bi bi-receipt me-1"></i> 2. Purchase + Purchase Items + Items + Item Types JOIN
          </button>
        </li>
      </ul>

      {/* Tab 1: Item + Item Type JOIN */}
      {activeTab === 'items' && (
        <div>
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-code-slash text-primary me-2"></i>SQL Query Specification
              </h6>
              <button onClick={fetchItemsJoin} className="btn btn-sm btn-outline-primary">
                <i className="bi bi-arrow-clockwise me-1"></i> Re-execute Query
              </button>
            </div>
            <div className="card-body p-3">
              <pre className="bg-dark text-success p-3 rounded mb-2 small font-monospace">
{itemsJoinData?.sql_query || `SELECT i.id, i.name, it.type_name, i.purchase_date, i.stock_available, i.active 
FROM items i 
JOIN item_types it ON i.item_type_id = it.id;`}
              </pre>
              <div className="small text-muted">
                <strong>Relational Relationship:</strong> <code>items (item_type_id) &rarr; item_types (id)</code>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0 text-dark">
                Live Query Result ({itemsJoinData?.total_count ?? 0} rows retrieved from MySQL)
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 font-monospace small">
                <thead className="table-light">
                  <tr>
                    <th>i.id</th>
                    <th>i.name</th>
                    <th>it.type_name</th>
                    <th>i.purchase_date</th>
                    <th className="text-center">i.stock_available</th>
                    <th>i.active</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">Executing query...</td>
                    </tr>
                  ) : itemsJoinData?.records?.length > 0 ? (
                    itemsJoinData.records.map((r) => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td className="fw-bold">{r.name}</td>
                        <td><span className="badge bg-secondary-subtle text-secondary border">{r.type_name}</span></td>
                        <td>{r.purchase_date}</td>
                        <td className="text-center">{r.stock_available}</td>
                        <td>{r.active ? <span className="text-success">1 (True)</span> : <span className="text-muted">0 (False)</span>}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Purchase Details 4-Table JOIN */}
      {activeTab === 'purchase' && (
        <div>
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-code-slash text-primary me-2"></i>4-Table Relational JOIN Query
              </h6>

              <div className="d-flex align-items-center gap-2">
                <label className="small text-muted fw-semibold">Select Order:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '180px' }}
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                >
                  {purchasesList.map((p) => (
                    <option key={p.id} value={p.order_id}>
                      {p.order_id} ({p.purchase_date})
                    </option>
                  ))}
                </select>
                <button onClick={() => fetchPurchaseJoin(selectedOrderId)} className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-play-fill"></i> Execute
                </button>
              </div>
            </div>
            <div className="card-body p-3">
              <pre className="bg-dark text-success p-3 rounded mb-2 small font-monospace">
{purchaseJoinData?.sql_query || `SELECT p.order_id, p.purchase_date, i.id AS item_id, i.name AS item_name, 
       it.type_name, pi.quantity 
FROM purchases p 
JOIN purchase_items pi ON p.id = pi.purchase_id 
JOIN items i ON pi.item_id = i.id 
JOIN item_types it ON i.item_type_id = it.id 
WHERE p.order_id = ?;`}
              </pre>
              <div className="small text-muted">
                <strong>Joined Tables:</strong> <code>purchases (p) &rarr; purchase_items (pi) &rarr; items (i) &rarr; item_types (it)</code>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0 text-dark">
                Query Result for Order "{selectedOrderId}" ({purchaseJoinData?.total_items ?? 0} lines retrieved)
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 font-monospace small">
                <thead className="table-light">
                  <tr>
                    <th>p.order_id</th>
                    <th>p.purchase_date</th>
                    <th>item_id</th>
                    <th>item_name</th>
                    <th>it.type_name</th>
                    <th className="text-center">pi.quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">Executing query...</td>
                    </tr>
                  ) : purchaseJoinData?.records?.length > 0 ? (
                    purchaseJoinData.records.map((r, i) => (
                      <tr key={i}>
                        <td className="fw-bold text-primary">{r.order_id}</td>
                        <td>{r.purchase_date}</td>
                        <td>{r.item_id}</td>
                        <td className="fw-semibold">{r.item_name}</td>
                        <td><span className="badge bg-secondary-subtle text-secondary border">{r.type_name}</span></td>
                        <td className="text-center fw-bold">{r.quantity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">No items found for this order.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SQLJoinsDemo;
