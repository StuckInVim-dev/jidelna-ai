import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PreferencesPage.css';

const PreferencesPage = () => {
    const [preferences, setPreferences] = useState({
        is_vegan: false,
        allergies: [],
        preferred_foods: []
    });
    const [newAllergy, setNewAllergy] = useState('');
    const [newPreferredFood, setNewPreferredFood] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/preferences', { withCredentials: true });
            if (response.data.success) {
                setPreferences(response.data.preferences);
            }
        } catch (error) {
            setMessage('Failed to load preferences');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/preferences', preferences, { withCredentials: true });
            if (response.data.success) {
                setMessage('Preferences saved successfully!');
            }
        } catch (error) {
            setMessage('Failed to save preferences');
        }
    };

    const addAllergy = () => {
        if (newAllergy && !preferences.allergies.includes(newAllergy)) {
            setPreferences({
                ...preferences,
                allergies: [...preferences.allergies, newAllergy]
            });
            setNewAllergy('');
        }
    };

    const removeAllergy = (allergy) => {
        setPreferences({
            ...preferences,
            allergies: preferences.allergies.filter(a => a !== allergy)
        });
    };

    const addPreferredFood = () => {
        if (newPreferredFood && !preferences.preferred_foods.includes(newPreferredFood)) {
            setPreferences({
                ...preferences,
                preferred_foods: [...preferences.preferred_foods, newPreferredFood]
            });
            setNewPreferredFood('');
        }
    };

    const removePreferredFood = (food) => {
        setPreferences({
            ...preferences,
            preferred_foods: preferences.preferred_foods.filter(f => f !== food)
        });
    };

    return (
        <div className="preferences-container">
            <h2>Dietary Preferences</h2>
            {message && <div className="message">{message}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="preference-section">
                    <label>
                        <input
                            type="checkbox"
                            checked={preferences.is_vegan}
                            onChange={(e) => setPreferences({...preferences, is_vegan: e.target.checked})}
                        />
                        I am vegan
                    </label>
                </div>

                <div className="preference-section">
                    <h3>Allergies</h3>
                    <div className="input-group">
                        <input
                            type="text"
                            value={newAllergy}
                            onChange={(e) => setNewAllergy(e.target.value)}
                            placeholder="Add allergy..."
                        />
                        <button type="button" onClick={addAllergy}>Add</button>
                    </div>
                    <ul>
                        {preferences.allergies.map((allergy, index) => (
                            <li key={index}>
                                {allergy}
                                <button type="button" onClick={() => removeAllergy(allergy)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="preference-section">
                    <h3>Preferred Foods</h3>
                    <div className="input-group">
                        <input
                            type="text"
                            value={newPreferredFood}
                            onChange={(e) => setNewPreferredFood(e.target.value)}
                            placeholder="Add preferred food..."
                        />
                        <button type="button" onClick={addPreferredFood}>Add</button>
                    </div>
                    <ul>
                        {preferences.preferred_foods.map((food, index) => (
                            <li key={index}>
                                {food}
                                <button type="button" onClick={() => removePreferredFood(food)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <button type="submit" className="save-button">Save Preferences</button>
            </form>
        </div>
    );
};

export default PreferencesPage;