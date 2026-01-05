
import React, { useEffect, useState } from 'react';
import { useSchoolData } from '../hooks/useSchoolData';
import { Payment } from '../types';
import Spinner from './common/Spinner';

const PaymentTable: React.FC<{ payments: Payment[]; isRejectedList?: boolean }> = ({ payments, isRejectedList = false }) => {
     if (payments.length === 0) {
        return <p className="text-center p-8 text-gray-500">No hay pagos en esta categoría.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Fecha</th>
                        <th scope="col" className="px-6 py-3">{isRejectedList ? "Representante / Cédula" : "Representante"}</th>
                        <th scope="col" className="px-6 py-3">Monto</th>
                        <th scope="col" className="px-6 py-3">Método</th>
                        <th scope="col" className="px-6 py-3">Referencia</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{payment.paymentDate}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {payment.representativeName}
                                {isRejectedList && (
                                    <><br/><span className="font-normal text-gray-500">C.I: {payment.representativeCedula}</span></>
                                )}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-800">${payment.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">{payment.paymentMethod}</td>
                            <td className="px-6 py-4">{payment.reference || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const AccountsLedger: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'approved' | 'rejected'>('approved');
    const { approvedPayments, rejectedPayments, fetchLedgerPayments, isLoading } = useSchoolData();

    useEffect(() => {
        fetchLedgerPayments();
    }, [fetchLedgerPayments]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Libro de Cuentas</h1>
            
            <div className="mb-4 border-b border-gray-200">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                    <li className="mr-2" role="presentation">
                        <button 
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'approved' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('approved')}
                            role="tab"
                        >
                            Pagos Aprobados
                        </button>
                    </li>
                    <li className="mr-2" role="presentation">
                        <button 
                             className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'rejected' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('rejected')}
                            role="tab"
                        >
                            Historial de Rechazados
                        </button>
                    </li>
                </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Spinner /></div>
                ) : (
                    <div>
                        {activeTab === 'approved' && <PaymentTable payments={approvedPayments} />}
                        {activeTab === 'rejected' && <PaymentTable payments={rejectedPayments} isRejectedList={true} />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountsLedger;
