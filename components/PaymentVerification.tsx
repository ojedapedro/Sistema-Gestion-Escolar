
import React, { useEffect } from 'react';
import { useSchoolData } from '../hooks/useSchoolData';
import Spinner from './common/Spinner';

const PaymentVerification: React.FC = () => {
    const { pendingPayments, fetchPendingPayments, verifyPayment, isLoading, error } = useSchoolData();

    useEffect(() => {
        fetchPendingPayments();
    }, [fetchPendingPayments]);

    const handleVerify = (paymentId: string, status: 'approved' | 'rejected') => {
        verifyPayment(paymentId, status);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Verificación de Pagos</h1>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Fecha</th>
                                <th scope="col" className="px-6 py-3">Representante</th>
                                <th scope="col" className="px-6 py-3">Monto</th>
                                <th scope="col" className="px-6 py-3">Método</th>
                                <th scope="col" className="px-6 py-3">Referencia</th>
                                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} className="text-center p-8">
                                        <div className="flex justify-center"><Spinner /></div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && pendingPayments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-500">
                                        No hay pagos pendientes por verificar.
                                    </td>
                                </tr>
                            )}
                            {pendingPayments.map(payment => (
                                <tr key={payment.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{payment.paymentDate}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{payment.representativeName} <br/><span className="font-normal text-gray-500">C.I: {payment.representativeCedula}</span></td>
                                    <td className="px-6 py-4 font-bold text-gray-800">${payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">{payment.paymentMethod}</td>
                                    <td className="px-6 py-4">{payment.reference}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleVerify(payment.id, 'approved')} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Aprobar</button>
                                            <button onClick={() => handleVerify(payment.id, 'rejected')} className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Rechazar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {error && <p className="mt-4 text-center text-red-600">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default PaymentVerification;
