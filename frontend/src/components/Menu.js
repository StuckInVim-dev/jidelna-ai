import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Menu.css';

function Menu({ refreshUserData }) {
  const [menu, setMenu] = useState({});
  const [orderItemId, setOrderItemId] = useState('');
  const [isOrdering, setIsOrdering] = useState(true);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/menus', { withCredentials: true });
        if (response.data.success) {
          setMenu(response.data.menus);
        } else {
          console.error('Failed to fetch menu:', response.data.error);
        }
      } catch (error) {
        console.error('Failed to connect to the server');
      }
    };

    fetchMenu();
  }, []);

  const handleOrder = async () => {
    if (!orderItemId) {
      setOrderError('Please enter an item ID');
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/order',
        { item_id: orderItemId, quantity: isOrdering ? 1 : 0 },
        { withCredentials: true }
      );
      if (response.data.success) {
        setOrderMessage(`Item ${orderItemId} ${isOrdering ? 'added to' : 'removed from'} order`);
        setOrderError('');
        // Optionally refresh the menu to show updated amounts
        axios.get('http://localhost:5000/api/menus', { withCredentials: true })
          .then(res => {
            if (res.data.success) {
              setMenu(res.data.menus);
            }
          });
      } else {
        setOrderMessage('');
        setOrderError(response.data.error || 'Failed to order item');
      }
    } catch (error) {
      setOrderMessage('');
      setOrderError('Failed to connect to the server');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/submit-order', {}, { withCredentials: true });
      if (response.data.success) {
        // Convert object to string if it's an object
        const message = typeof response.data.result === 'object' 
          ? JSON.stringify(response.data.result) 
          : response.data.result || 'Order submitted successfully';
        setSubmitMessage(message);
        setSubmitError('');
        
        // Refresh user data to update the balance
        if (refreshUserData) {
          refreshUserData();
        }
      } else {
        setSubmitMessage('');
        setSubmitError(response.data.error || 'Failed to submit order');
      }
    } catch (error) {
      setSubmitMessage('');
      setSubmitError('Failed to connect to the server');
    }
  };

 // Helper function to sort table keys numerically
 const sortTableKeys = (keys) => {
  return keys.sort((a, b) => {
    // Extract numbers from table keys (e.g., "table1" -> 1)
    const numA = parseInt(a.replace('table', ''));
    const numB = parseInt(b.replace('table', ''));
    return numA - numB;
  });
};

return (
  <div className="menu-section">
    <h2 className="card-title mb-4">Today's Menu</h2>
    
    {Object.keys(menu).length > 0 ? (
      sortTableKeys(Object.keys(menu).filter(key => key.startsWith('table'))).map((key) => (
        <div key={key} className="menu-table">
          <div className="menu-table-header">
            {key.replace('table', 'Table ')}
          </div>
          <div className="menu-table-content">
            {menu[key].map((item) => (
              <div key={item.veta} className="menu-item">
                <div className="menu-item-info">
                  <span className="menu-item-name">{item.nazev || 'No name'}</span>
                  <span className="menu-item-id">(ID: {item.veta})</span>
                </div>
                <span className="menu-item-ordered">
                  Ordered: {item.pocet || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))
    ) : (
      <div className="card">
        <p>No menu items available.</p>
      </div>
    )}

    <div className="card mt-4">
      <h3 className="card-title mb-3">Order Item</h3>
      {orderMessage && <div className="success-message">{orderMessage}</div>}
      {orderError && <div className="error-message">{orderError}</div>}
      <div className="form-group">
        <label htmlFor="orderItemId">Item ID:</label>
        <input
          type="text"
          id="orderItemId"
          value={orderItemId}
          onChange={(e) => setOrderItemId(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={isOrdering}
            onChange={(e) => setIsOrdering(e.target.checked)}
          />
          <span>{isOrdering ? 'Order' : 'Unorder'} this item</span>
        </label>
      </div>
      <button 
        onClick={handleOrder} 
        disabled={isProcessing}
        className={isOrdering ? 'btn-success' : 'btn-primary'} // Cba changing CSS, I am not proud of this
      >
        {isProcessing ? 'Processing...' : isOrdering ? 'Add to Order' : 'Remove from Order'}
      </button>
    </div>

    <div className="card mt-4">
      <h3 className="card-title mb-3">Submit Order</h3>
      {submitMessage && <div className="success-message">{submitMessage}</div>}
      {submitError && <div className="error-message">{submitError}</div>}
      <button onClick={handleSubmitOrder} className="btn-success">Submit Order</button>
    </div>
  </div>
);
}

export default Menu;