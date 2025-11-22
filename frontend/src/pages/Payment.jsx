import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Banknote, CheckCircle } from 'lucide-react';

const Payment = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Data from Dashboard
    const { cartItems, totalAmount, retailerId } = location.state || { 
        cartItems: [], totalAmount: 0, retailerId: null 
    };

    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' or 'CASH'
    
    // Card Form State
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

    useEffect(() => {
        if (!cartItems || cartItems.length === 0 || !retailerId) {
            alert("Invalid session. Returning to dashboard.");
            navigate('/customer/dashboard');
        }
    }, [cartItems, retailerId, navigate]);

    const handleInputChange = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate Delay (Shorter for Cash)
        const delay = paymentMethod === 'CASH' ? 1000 : 2000;

        setTimeout(async () => {
            try {
                // Prepare Payload
                const orderData = {
                    customerId: user.id,
                    retailerId: parseInt(retailerId),
                    totalAmount: totalAmount,
                    // 🟢 NEW: Send correct mode
                    paymentMode: paymentMethod === 'CARD' ? "ONLINE" : "OFFLINE", 
                    items: cartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        priceAtPurchase: item.price
                    }))
                };

                await createOrder(orderData);
                
                // Success Message
                const msg = paymentMethod === 'CARD' 
                    ? "Payment Verified! Order Placed. 💳" 
                    : "Order Placed! Please pay ₹" + totalAmount + " on delivery. 💵";
                
                alert(msg);
                navigate('/customer/dashboard'); 
                
            } catch (error) {
                console.error("Order failed", error);
                alert("Order Creation failed: " + (error.response?.data || error.message));
            } finally {
                setLoading(false);
            }
        }, delay);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Checkout</h2>
                
                {/* Order Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                    <span className="text-blue-600 font-semibold">Total Amount</span>
                    <span className="text-3xl font-bold text-blue-800">₹{totalAmount?.toFixed(2)}</span>
                </div>

                {/* 🟢 NEW: Payment Method Toggles */}
                <div className="flex gap-4 mb-6">
                    <button 
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`flex-1 py-3 rounded-lg font-bold flex flex-col items-center gap-1 border transition ${
                            paymentMethod === 'CARD' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <CreditCard className="w-6 h-6" /> Credit Card
                    </button>
                    <button 
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex-1 py-3 rounded-lg font-bold flex flex-col items-center gap-1 border transition ${
                            paymentMethod === 'CASH' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Banknote className="w-6 h-6" /> Cash on Delivery
                    </button>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                    {/* Only show Card Inputs if CARD is selected */}
                    {paymentMethod === 'CARD' ? (
                        <div className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                                <input type="text" name="number" required placeholder="0000 0000 0000 0000"
                                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={handleInputChange} />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                                    <input type="text" name="expiry" required placeholder="MM/YY"
                                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={handleInputChange} />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVV</label>
                                    <input type="password" name="cvv" required placeholder="123"
                                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={handleInputChange} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name on Card</label>
                                <input type="text" name="name" required placeholder="John Doe"
                                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={handleInputChange} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center border border-green-200 animate-fadeIn">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <p className="font-bold">Pay with Cash/UPI upon delivery.</p>
                            <p className="text-sm">Our delivery partner will collect ₹{totalAmount} at your doorstep.</p>
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className={`w-full font-bold py-3 px-4 rounded-lg transition duration-300 text-white mt-4 ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 
                            paymentMethod === 'CARD' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                        }`}>
                        {loading ? 'Processing...' : paymentMethod === 'CARD' ? `Pay ₹${totalAmount}` : 'Place Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Payment;