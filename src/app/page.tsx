"use client";
import 'tailwindcss/tailwind.css';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const [preferences, setPreferences] = useState({ vegetarian: false, allergies: "" });
    const meals = ["Kuřecí řízek", "Vegetariánské lasagne", "Hovězí guláš", "Salát s tuňákem"];

    const selectMeal = () => {
        const meal = meals[Math.floor(Math.random() * meals.length)];
        setSelectedMeal(meal);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
        {/* Navbar with text logo and auth buttons */}
        <div className="w-full bg-white p-3 shadow flex justify-between items-center">
            {/* Text logo on the left */}
            <Link href="/">
                <span className="text-lg font-bold text-blue-600">JidelnAI</span>
            </Link>
            
            {/* Auth buttons on the right */}
            <div>
                <Link href="/login">
                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 border border-blue-500 hover:border-transparent rounded mr-2">
                        Přihlásit se
                    </button>
                </Link>
                <Link href="/register">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-4 border border-blue-500 rounded">
                        Registrovat
                    </button>
                </Link>
            </div>
        </div>
            
            {/* Main content */}
            <div className="flex-grow flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-6 rounded shadow">
                    <h1 className="text-2xl font-bold mb-6 text-black">Automatický výběr oběda</h1>
                    <h2 className="text-lg font-semibold mb-4 text-black">Nastavení preferencí</h2>
                    <div className="mb-4">
                        <label className="flex items-center text-black">
                            <input
                                type="checkbox"
                                checked={preferences.vegetarian}
                                onChange={(e) => setPreferences({ ...preferences, vegetarian: e.target.checked })}
                                className="mr-2"
                            />
                            Jsem vegetarián
                        </label>
                        {preferences.vegetarian && (
                            <p className="text-sm text-red-500 mt-2">Tato možnost dočasně nefunguje.</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-black font-medium mb-2">Alergie:</label>
                        <input
                            type="text"
                            value={preferences.allergies}
                            onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
                            className="border rounded w-full py-2 px-3 text-black"
                            placeholder="Zadejte alergie"
                        />
                    </div>
                    
                    <button
                        onClick={selectMeal}
                        className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
                    >
                        Vyber oběd
                    </button>
                    
                    {selectedMeal && (
                        <div className="mt-4 p-4 bg-green-100 rounded">
                            <h2 className="text-lg font-semibold text-black">Vybraný oběd:</h2>
                            <p className="text-black">{selectedMeal}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}