
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { schoolApiService } from '../services/googleSheetsService';
import { Representative, Student, Payment, StudentPaymentSummary, Level, Grade, PaymentStatus } from '../types';
import { MONTHLY_FEES } from '../constants';

interface SchoolDataContextType {
    representative: Representative | null;
    paymentSummaries: StudentPaymentSummary[];
    pendingPayments: Payment[];
    approvedPayments: Payment[];
    rejectedPayments: Payment[];
    isLoading: boolean;
    error: string | null;
    exchangeRate: number;
    findRepresentative: (cedula: string) => Promise<void>;
    addPayment: (paymentData: Omit<Payment, 'id' | 'timestamp' | 'registrationDate' | 'representativeName' | 'matricula'>) => Promise<boolean>;
    addStudent: (data: { repCedula: string; repName: string; phone: string; email: string; address: string; studentName: string; level: Level; grade: Grade; section: string }) => Promise<Representative | null>;
    fetchAllDataForReport: () => Promise<{ representatives: Representative[], payments: Payment[] } | null>;
    fetchPendingPayments: () => Promise<void>;
    fetchLedgerPayments: () => Promise<void>;
    verifyPayment: (paymentId: string, status: 'approved' | 'rejected') => Promise<void>;
    updateExchangeRate: (newRate: number) => void;
    clearData: () => void;
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

export const SchoolDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [representative, setRepresentative] = useState<Representative | null>(null);
    const [paymentSummaries, setPaymentSummaries] = useState<StudentPaymentSummary[]>([]);
    const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
    const [approvedPayments, setApprovedPayments] = useState<Payment[]>([]);
    const [rejectedPayments, setRejectedPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exchangeRate, setExchangeRate] = useState<number>(37.50); // Default exchange rate

    const updateExchangeRate = (newRate: number) => {
        setExchangeRate(newRate);
    };

    const clearData = useCallback(() => {
        setRepresentative(null);
        setPaymentSummaries([]);
        setError(null);
    }, []);

    const findRepresentative = useCallback(async (cedula: string) => {
        setIsLoading(true);
        clearData();
        try {
            const repData = await schoolApiService.getRepresentativeByCedula(cedula);
            if (repData) {
                setRepresentative(repData);
                const summaries: StudentPaymentSummary[] = await Promise.all(
                    repData.students.map(async (student) => {
                        const currentMonth = new Date().getMonth() + 1;
                        const currentYear = new Date().getFullYear();
                        const payments = await schoolApiService.getPaymentsForStudent(student.id, currentMonth, currentYear);
                        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                        const monthlyFee = MONTHLY_FEES[student.level];
                        const pendingBalance = Math.max(0, monthlyFee - totalPaid);
                        
                        return {
                            student,
                            monthlyFee,
                            totalPaid,
                            pendingBalance,
                            status: pendingBalance > 0 ? 'Moroso' : 'Solvente',
                            payments,
                        };
                    })
                );
                setPaymentSummaries(summaries);
            } else {
                setError('No se encontró un representante con esa cédula.');
            }
        } catch (err) {
            setError('Ocurrió un error al buscar los datos. Por favor, intente de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [clearData]);

    const addPayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'timestamp' | 'registrationDate' | 'representativeName' | 'matricula'>) => {
        if (!representative) {
            setError('No representative selected.');
            return false;
        }
        setIsLoading(true);
        try {
            const fullPaymentData = {
                ...paymentData,
                representativeName: representative.fullName,
                matricula: representative.matricula,
            };
            await schoolApiService.addPayment(fullPaymentData);
            await findRepresentative(representative.cedula);
            return true;
        } catch (err) {
            setError('Error al registrar el pago.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [representative, findRepresentative]);

    const addStudent = useCallback(async (data: { repCedula: string; repName: string; phone: string; email: string; address: string; studentName: string; level: Level; grade: Grade; section: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            return await schoolApiService.addStudentAndRepresentative(data);
        } catch (err) {
            setError('Error al registrar el nuevo alumno.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAllDataForReport = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            return await schoolApiService.getAllDataForReports();
        } catch (err) {
            setError('Error al obtener los datos para el reporte.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const fetchPendingPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const payments = await schoolApiService.getPaymentsByStatus('pending-verification');
            setPendingPayments(payments);
        } catch (err) {
            setError('Error al obtener los pagos pendientes.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLedgerPayments = useCallback(async () => {
        setIsLoading(true);
        try {
             const [approved, rejected] = await Promise.all([
                schoolApiService.getPaymentsByStatus('approved'),
                schoolApiService.getPaymentsByStatus('rejected')
            ]);
            setApprovedPayments(approved);
            setRejectedPayments(rejected);
        } catch (err) {
            setError('Error al obtener los pagos del libro de cuentas.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyPayment = useCallback(async (paymentId: string, status: 'approved' | 'rejected') => {
        setIsLoading(true);
        try {
            await schoolApiService.updatePaymentStatus(paymentId, status);
            await fetchPendingPayments(); // Refresh the list
        } catch (err) {
             setError('Error al verificar el pago.');
        } finally {
            setIsLoading(false);
        }
    }, [fetchPendingPayments]);


    const contextValue = {
        representative, paymentSummaries, pendingPayments, approvedPayments, rejectedPayments,
        isLoading, error, exchangeRate, findRepresentative, addPayment, addStudent, 
        fetchAllDataForReport, fetchPendingPayments, fetchLedgerPayments, verifyPayment,
        updateExchangeRate, clearData
    };

    return (
        <SchoolDataContext.Provider value={contextValue}>
            {children}
        </SchoolDataContext.Provider>
    );
};

export const useSchoolData = (): SchoolDataContextType => {
    const context = useContext(SchoolDataContext);
    if (context === undefined) {
        throw new Error('useSchoolData must be used within a SchoolDataProvider');
    }
    return context;
};
