"use client";
import 'tailwindcss/tailwind.css';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const [preferences, setPreferences] = useState({
        vegetarian: false,
        allergies: [] as string[],
        meatPreference: "any", // New preference for meat type
    });

    const allergensList = ["vejce", "mléko", "lepek", "ořechy", "ryby"];

    // Define meals with properties
    const meals = [
        { name: "Kuřecí řízek", vegetarian: false, meat: "chicken", ingredients: ["kuřecí maso", "strouhanka", "vejce"] },
        { name: "Vegetariánské lasagne", vegetarian: true, meat: null, ingredients: ["těstoviny", "rajčata", "sýr", "mléko"] },
        { name: "Hovězí guláš", vegetarian: false, meat: "beef", ingredients: ["hovězí maso", "cibule", "paprika"] },
        { name: "Salát s tuňákem", vegetarian: false, meat: "fish", ingredients: ["tuňák", "salát", "rajčata", "ryby"] },
    ];

    const selectMeal = () => {
        // Filter meals based on preferences
        const filteredMeals = meals.filter((meal) => {
            if (preferences.vegetarian && !meal.vegetarian) {
                return false;
            }
            if (preferences.meatPreference === "none" && meal.meat !== null) {
                return false;
            }
            if (preferences.meatPreference !== "any" && preferences.meatPreference !== "none" && meal.meat !== preferences.meatPreference) {
                return false;
            }
            if (preferences.allergies) {
                const allergies = preferences.allergies.map(allergy => allergy.toLowerCase().trim());
                return !allergies.some(allergy => meal.ingredients.some(ingredient => ingredient.toLowerCase().includes(allergy)));
            }
            return true;
        });

        // Select a random meal from the filtered list
        if (filteredMeals.length > 0) {
            const meal = filteredMeals[Math.floor(Math.random() * filteredMeals.length)];
            setSelectedMeal(meal.name);
        } else {
            setSelectedMeal("Žádné jídlo neodpovídá vašim preferencím.");
        }
    };
    const toggleAllergy = (allergy: string) => {
        setPreferences((prev) => {
            const allergies = prev.allergies.includes(allergy)
                ? prev.allergies.filter((a) => a !== allergy)
                : [...prev.allergies, allergy];
            return { ...prev, allergies };
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Navbar with text logo and auth buttons */}
            <div className="w-full bg-white p-3 shadow flex justify-between items-center">
                <Link href="/">
                    <span className="text-lg font-bold text-blue-600">JidelnAI</span>
                </Link>
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

                    {/* Vegetarian preference */}
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
                    </div>

                    {/* Meat preference */}
                    <div className="mb-4">
                        <label className="block text-black font-medium mb-2">Preferované maso:</label>
                        <select
                            value={preferences.meatPreference}
                            onChange={(e) => setPreferences({ ...preferences, meatPreference: e.target.value })}
                            className="border rounded w-full py-2 px-3 text-black"
                        >
                            <option value="any">Jakékoliv</option>
                            <option value="chicken">Kuřecí</option>
                            <option value="beef">Hovězí</option>
                            <option value="fish">Ryba</option>
                            <option value="none">Žádné</option>
                        </select>
                    </div>

                    {/* Allergies */}
                    <div className="mb-4">
                        <label className="block text-black font-medium mb-2">Alergie:</label>
                        <div className="flex flex-wrap gap-2">
                            {allergensList.map((allergy) => (
                                <label key={allergy} className="flex items-center text-black">
                                    <input
                                        type="checkbox"
                                        checked={preferences.allergies.includes(allergy)}
                                        onChange={() => toggleAllergy(allergy)}
                                        className="mr-2"
                                    />
                                    {allergy}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Select meal button */}
                    <button
                        onClick={selectMeal}
                        className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
                    >
                        Vyber oběd
                    </button>

                    {/* Selected meal display */}
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