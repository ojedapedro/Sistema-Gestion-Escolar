
import React, { useState } from 'react';
import { useSchoolData } from '../hooks/useSchoolData';
import { Student, PaymentMethod, Payment } from '../types';
import { MONTHS, PAYMENT_METHODS } from '../constants';
import Spinner from './common/Spinner';
import Modal from './common/Modal';

const PaymentForm: React.FC<{ student: Student; onPaymentSubmit: (paymentData: any) => void; onClose: () => void }> = ({ student, onPaymentSubmit, onClose }) => {
    const { representative, exchangeRate } = useSchoolData();
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PAGO_MOVIL);
    const [reference, setReference] = useState<string>('');
    const [observations, setObservations] = useState<string>('');
    
    const amountInBs = (parseFloat(amount) * exchangeRate).toFixed(2);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const paymentData = {
            representativeCedula: representative!.cedula,
            studentId: student.id,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod,
            reference,
            amount: parseFloat(amount),
            status: [PaymentMethod.PAGO_MOVIL, PaymentMethod.TRANSFERENCIA, PaymentMethod.ZELLE].includes(paymentMethod) 
                ? 'pending-verification' 
                : 'approved',
            observations,
        };
        onPaymentSubmit(paymentData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold">Registrar Pago para: <span className="text-blue-600">{student.name}</span></h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">Monto a Pagar ($)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required step="0.01" />
                {amount && !isNaN(parseFloat(amount)) && <p className="text-sm text-gray-500 mt-1">Equivale a: Bs. {amountInBs}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                </select>
            </div>
             {[PaymentMethod.PAGO_MOVIL, PaymentMethod.TRANSFERENCIA, PaymentMethod.ZELLE].includes(paymentMethod) && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Referencia</label>
                    <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
             )}
            <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea value={observations} onChange={(e) => setObservations(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Registrar Pago</button>
            </div>
        </form>
    );
};


const PaymentRegistration: React.FC = () => {
    const [cedula, setCedula] = useState('');
    const { representative, paymentSummaries, isLoading, error, findRepresentative, addPayment, clearData, exchangeRate } = useSchoolData();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (cedula.trim()) {
            findRepresentative(cedula.trim());
        }
    };
    
    const handleNewSearch = () => {
        clearData();
        setCedula('');
    };

    const handlePaymentSubmit = async (paymentData: Omit<Payment, 'id' | 'timestamp' | 'registrationDate' | 'representativeName' | 'matricula'>) => {
        const success = await addPayment(paymentData);
        if (success) {
            setSelectedStudent(null);
        }
    };
    
    const formatCurrency = (amount: number, rate: number) => {
      return `Bs. ${(amount * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Registro y Consulta de Pagos</h1>
            
            {!representative && (
                 <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
                    <form onSubmit={handleSearch}>
                        <label htmlFor="cedula" className="block text-lg font-medium text-gray-700 mb-2">
                            Cédula del Representante
                        </label>
                        <div className="flex">
                            <input
                                id="cedula"
                                type="text"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                className="flex-grow block w-full px-4 py-3 text-lg bg-gray-50 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: 12345678"
                            />
                            <button type="submit" className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300" disabled={isLoading}>
                                {isLoading ? <Spinner size="sm" /> : 'Buscar'}
                            </button>
                        </div>
                    </form>
                    {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                </div>
            )}

            {representative && (
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{representative.fullName}</h2>
                            <p className="text-gray-600">C.I: {representative.cedula}</p>
                            <p className="text-gray-600">Matrícula: {representative.matricula}</p>
                        </div>
                        <button onClick={handleNewSearch} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">
                           Nueva Búsqueda
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">Estado de Cuenta - {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</h3>
                         {isLoading && !paymentSummaries.length ? <div className="text-center p-8"><Spinner /></div> : paymentSummaries.map(summary => (
                            <div key={summary.student.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-center bg-gray-50">
                                <div>
                                    <p className="font-bold text-lg">{summary.student.name}</p>
                                    <p className="text-sm text-gray-500">{summary.student.level} - {summary.student.grade} '{summary.student.section}'</p>
                                    <p className="text-sm text-gray-500">Mensualidad: ${summary.monthlyFee.toFixed(2)} <span className="text-xs">({formatCurrency(summary.monthlyFee, exchangeRate)})</span></p>
                                </div>
                                <div className="text-center my-2 md:my-0">
                                    <p className="text-sm text-gray-500">Pagado este mes</p>
                                    <p className="font-bold text-xl text-green-600">${summary.totalPaid.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(summary.totalPaid, exchangeRate)}</p>
                                </div>
                                <div className="text-center my-2 md:my-0">
                                    <p className="text-sm text-gray-500">Saldo Pendiente</p>
                                    <p className={`font-bold text-xl ${summary.pendingBalance > 0 ? 'text-red-600' : 'text-gray-600'}`}>${summary.pendingBalance.toFixed(2)}</p>
                                    <p className={`text-xs ${summary.pendingBalance > 0 ? 'text-red-500' : 'text-gray-500'}`}>{formatCurrency(summary.pendingBalance, exchangeRate)}</p>
                                </div>
                                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                                     <span className={`px-3 py-1 text-sm font-semibold rounded-full ${summary.status === 'Solvente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {summary.status}
                                    </span>
                                    <button onClick={() => setSelectedStudent(summary.student)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 w-full md:w-auto">
                                        Registrar Pago
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
            
            {selectedStudent && (
                 <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)}>
                    <PaymentForm 
                        student={selectedStudent} 
                        onPaymentSubmit={handlePaymentSubmit} 
                        onClose={() => setSelectedStudent(null)} 
                    />
                 </Modal>
            )}
        </div>
    );
};

export default PaymentRegistration;
