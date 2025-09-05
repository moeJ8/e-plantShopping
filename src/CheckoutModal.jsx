import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from './CartSlice';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose }) => {
  const cart = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState('summary'); // summary, payment, processing, complete
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [orderSnapshot, setOrderSnapshot] = useState(null);

  // Calculate total amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemCost = parseFloat(item.cost.substring(1));
      return total + (itemCost * item.quantity);
    }, 0).toFixed(2);
  };

  // Calculate total items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = () => {
    setCurrentStep('processing');
    
    // Store order details before clearing cart
    const orderDetails = {
      items: [...cart],
      total: calculateTotal(),
      totalItems: getTotalItems(),
      orderNumber: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerEmail: customerInfo.email
    };
    
    // Simulate payment processing
    setTimeout(() => {
      setOrderSnapshot(orderDetails);
      setCurrentStep('complete');
      // Clear the cart after successful payment
      dispatch(clearCart());
    }, 3000);
  };

  const handleClose = () => {
    if (currentStep === 'complete' && cart.length > 0) {
      dispatch(clearCart());
    }
    
    setCurrentStep('summary');
    setCustomerInfo({
      name: '',
      email: '',
      address: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    setOrderSnapshot(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {currentStep === 'summary' && 'Order Summary'}
            {currentStep === 'payment' && 'Payment Information'}
            {currentStep === 'processing' && 'Processing Payment...'}
            {currentStep === 'complete' && 'Order Complete!'}
          </h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {currentStep === 'summary' && (
            <div className="order-summary">
              <h3>Your Order ({getTotalItems()} items)</h3>
              <div className="order-items">
                {cart.map(item => (
                  <div key={item.name} className="order-item">
                    <img src={item.image} alt={item.name} className="order-item-image" />
                    <div className="order-item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      <span className="item-price">{item.cost} each</span>
                      <span className="item-total">
                        ${(parseFloat(item.cost.substring(1)) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <h3>Total: ${calculateTotal()}</h3>
              </div>
              <button 
                className="proceed-button"
                onClick={() => setCurrentStep('payment')}
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="payment-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Shipping Address</label>
                <textarea
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  placeholder="Enter your shipping address"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={customerInfo.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={customerInfo.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={customerInfo.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="3"
                  />
                </div>
              </div>
              <div className="payment-total">
                <h3>Total: ${calculateTotal()}</h3>
              </div>
              <div className="payment-buttons">
                <button 
                  className="back-button"
                  onClick={() => setCurrentStep('summary')}
                >
                  Back to Summary
                </button>
                <button 
                  className="pay-button"
                  onClick={handlePayment}
                  disabled={!customerInfo.name || !customerInfo.email || !customerInfo.cardNumber}
                >
                  Pay ${calculateTotal()}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="processing-payment">
              <div className="spinner"></div>
              <h3>Processing your payment...</h3>
              <p>Please wait while we process your order.</p>
            </div>
          )}

          {currentStep === 'complete' && orderSnapshot && (
            <div className="order-complete">
              <div className="success-icon">✅</div>
              <h3>Thank you for your purchase!</h3>
              <p>Your order has been successfully placed.</p>
              <div className="order-details">
                <p><strong>Order Number:</strong> #{orderSnapshot.orderNumber}</p>
                <p><strong>Total Amount:</strong> ${orderSnapshot.total}</p>
                <p><strong>Items Ordered:</strong> {orderSnapshot.totalItems} plants</p>
                <p><strong>Delivery:</strong> 3-5 business days</p>
              </div>
              <p>A confirmation email has been sent to {orderSnapshot.customerEmail}</p>
              <button 
                className="continue-button"
                onClick={handleClose}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
