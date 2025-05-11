import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FoodSelector.css';

const FoodSelector = ({ refreshUserData }) => {
    const [menu, setMenu] = useState({});
    const [selectedTable, setSelectedTable] = useState('');
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [preferences, setPreferences] = useState({
        is_vegan: false,
        allergies: [],
        preferred_foods: []
    });
    const [numberOfItems, setNumberOfItems] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Fetch menu data
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/menus', { withCredentials: true });
                if (response.data.success) {
                    setMenu(response.data.menus);
                    // Set the first table as default if available
                    const tableKeys = Object.keys(response.data.menus).filter(key => key.startsWith('table'));
                    if (tableKeys.length > 0) {
                        setSelectedTable(tableKeys[0]);
                    }
                } else {
                    setError('Failed to fetch menu: ' + response.data.error);
                }
            } catch (error) {
                setError('Failed to connect to the server');
            }
        };

        // Fetch user preferences
        const fetchPreferences = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/preferences', { withCredentials: true });
                if (response.data.success) {
                    setPreferences(response.data.preferences);
                }
            } catch (error) {
                console.error('Failed to load preferences');
            }
        };

        fetchMenu();
        fetchPreferences();
    }, []);

    // Helper function to sort table keys numerically
    const sortTableKeys = (keys) => {
        return keys.sort((a, b) => {
            const numA = parseInt(a.replace('table', ''));
            const numB = parseInt(b.replace('table', ''));
            return numA - numB;
        });
    };

    // Function to find recommended food items based on preferences
    const findRecommendedItems = () => {
        if (!selectedTable || !menu[selectedTable]) {
            setError('Please select a valid table');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const tableItems = menu[selectedTable];
            
            // Filter items based on preferences
            let filteredItems = [...tableItems];
            
            // Filter for vegan preference if enabled
            if (preferences.is_vegan) {
                // This is a simplified check - in a real app, you'd have more detailed food data
                filteredItems = filteredItems.filter(item => 
                    item.nazev && item.nazev.toLowerCase().includes('vegan'));
            }
            
            // Filter out items with allergies
            if (preferences.allergies.length > 0) {
                filteredItems = filteredItems.filter(item => {
                    const itemName = item.nazev ? item.nazev.toLowerCase() : '';
                    return !preferences.allergies.some(allergy => 
                        itemName.includes(allergy.toLowerCase()));
                });
            }
            
            // Prioritize preferred foods
            if (preferences.preferred_foods.length > 0) {
                filteredItems.sort((a, b) => {
                    const aName = a.nazev ? a.nazev.toLowerCase() : '';
                    const bName = b.nazev ? b.nazev.toLowerCase() : '';
                    
                    const aHasPreference = preferences.preferred_foods.some(food => 
                        aName.includes(food.toLowerCase()));
                    const bHasPreference = preferences.preferred_foods.some(food => 
                        bName.includes(food.toLowerCase()));
                    
                    if (aHasPreference && !bHasPreference) return -1;
                    if (!aHasPreference && bHasPreference) return 1;
                    return 0;
                });
            }
            
            // If no items match the criteria, use all items
            if (filteredItems.length === 0) {
                filteredItems = tableItems;
                setMessage('No items match your preferences exactly. Showing all available items.');
            }
            
            // Limit to the requested number of items
            const recommendedCount = Math.min(numberOfItems, filteredItems.length);
            setRecommendedItems(filteredItems.slice(0, recommendedCount));
            
            if (filteredItems.length > 0) {
                setMessage(`Found ${recommendedCount} recommended item(s) based on your preferences.`);
            }
        } catch (error) {
            setError('Error finding recommended items');
        } finally {
            setLoading(false);
        }
    };

    // Function to order a recommended item
    const orderItem = async (itemId) => {
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/order',
                { item_id: itemId, quantity: 1 },
                { withCredentials: true }
            );
            if (response.data.success) {
                setMessage(`Item ${itemId} added to your order!`);
                // Refresh user data to update balance
                if (refreshUserData) {
                    refreshUserData();
                }
            } else {
                setError(response.data.error || 'Failed to order item');
            }
        } catch (error) {
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="food-selector-container">
            <div className="disclaimer-box">
                <p><strong>Disclaimer:</strong> This is a showcase example only. In a production environment, this process would be automated to automatically select and order food for the next available day based on your preferences without manual intervention.</p>
            </div>
            
            <h2>Food Selector</h2>
            <p>Select a table and get food recommendations based on your preferences.</p>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            <div className="selector-controls">
                <div className="form-group">
                    <label htmlFor="tableSelect">Select Table:</label>
                    <select 
                        id="tableSelect"
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                    >
                        <option value="">-- Select a Table --</option>
                        {Object.keys(menu).length > 0 && 
                            sortTableKeys(Object.keys(menu).filter(key => key.startsWith('table')))
                                .map(tableKey => (
                                    <option key={tableKey} value={tableKey}>
                                        {tableKey.replace('table', 'Table ')}
                                    </option>
                                ))
                        }
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="itemCount">Number of Recommendations:</label>
                    <input
                        type="number"
                        id="itemCount"
                        min="1"
                        max="10"
                        value={numberOfItems}
                        onChange={(e) => setNumberOfItems(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                </div>
                
                <button 
                    onClick={findRecommendedItems}
                    disabled={loading || !selectedTable}
                    className="btn-danger"
                >
                    {loading ? 'Finding...' : 'Find Recommendations'}
                </button>
            </div>
            
            {recommendedItems.length > 0 && (
                <div className="recommendations-section">
                    <h3>Recommended Items</h3>
                    <div className="recommendations-list">
                        {recommendedItems.map((item) => (
                            <div key={item.veta} className="recommendation-item">
                                <div className="recommendation-details">
                                    <span className="item-name">{item.nazev || 'No name'}</span>
                                    <span className="item-id">(ID: {item.veta})</span>
                                </div>
                                <button 
                                    onClick={() => orderItem(item.veta)}
                                    disabled={loading}
                                    className="btn-sm btn-success"
                                >
                                    Order
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="preferences-summary">
                <h3>Vaše preference</h3>
                <ul>
                    <li>Veganské jídlo: {preferences.is_vegan ? 'Ano' : 'Ne'}</li>
                    <li>
                        Alergie: 
                        {preferences.allergies.length > 0 ? (
                            <div className="allergies-checklist">
                                {preferences.allergies.map((allergy, index) => (
                                    <div key={index} className="allergy-item">
                                        <input 
                                            type="checkbox" 
                                            id={`allergy-${index}`} 
                                            checked={true} 
                                            readOnly 
                                        />
                                        <label htmlFor={`allergy-${index}`}>{allergy}</label>
                                    </div>
                                ))}
                            </div>
                        ) : ' Žádné'}
                    </li>
                    <li>
                        Oblíbená jídla: 
                        {preferences.preferred_foods.length > 0 
                            ? preferences.preferred_foods.join(', ') 
                            : ' Žádné'}
                    </li>
                </ul>
                <p>
                    <a href="/preferences">Aktualizujte své preference</a> pro lepší doporučení.
                </p>
            </div>
        </div>
    );
};

export default FoodSelector;