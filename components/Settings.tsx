
import React, { useState } from 'react';
import { useSchoolData } from '../hooks/useSchoolData';

const Settings: React.FC = () => {
    const { exchangeRate, updateExchangeRate } = useSchoolData();
    const [rateInput, setRateInput] = useState<string>(exchangeRate.toString());
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newRate = parseFloat(rateInput);
        if (!isNaN(newRate) && newRate > 0) {
            updateExchangeRate(newRate);
            setSuccessMessage(`Tasa de cambio actualizada a ${newRate.toFixed(2)} Bs/$`);
            setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        } else {
            // Handle error case if needed
            alert("Por favor, ingrese un número válido y positivo.");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Configuración</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label htmlFor="exchangeRate" className="block text-lg font-medium text-gray-700">
                            Tasa de Cambio (Bs. por $)
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                            Esta tasa se usará para convertir todos los montos en la aplicación.
                        </p>
                        <input
                            id="exchangeRate"
                            type="number"
                            step="0.01"
                            value={rateInput}
                            onChange={(e) => setRateInput(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: 37.50"
                        />
                    </div>

                    {successMessage && (
                        <div className="p-3 text-center text-green-800 bg-green-100 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    <div className="pt-2 text-right">
                        <button
                            type="submit"
                            className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
