
import React, { useState } from 'react';
import { useSchoolData } from '../hooks/useSchoolData';
import { pdfService } from '../services/pdfService';
import { MONTHLY_FEES } from '../constants';
import Spinner from './common/Spinner';
import { PaymentStatus } from '../types';

type ReportType = 'payments' | 'status';
type StatusFilter = 'all' | 'moroso' | 'solvente';
type VerificationFilter = 'all' | PaymentStatus;

const Reports: React.FC = () => {
    const { fetchAllDataForReport, isLoading } = useSchoolData();
    const [reportType, setReportType] = useState<ReportType>('payments');
    const [cedulaFilter, setCedulaFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');

    const handleGenerateReport = async () => {
        const allData = await fetchAllDataForReport();
        if (!allData) return;

        let { representatives, payments } = allData;
        let filtersDescription = [];

        if (reportType === 'payments') {
            let filteredPayments = [...payments];

            if (cedulaFilter) {
                filteredPayments = filteredPayments.filter(p => p.representativeCedula.includes(cedulaFilter));
                filtersDescription.push(`Cédula: ${cedulaFilter}`);
            }
            if (dateFrom) {
                filteredPayments = filteredPayments.filter(p => p.paymentDate >= dateFrom);
                 filtersDescription.push(`Desde: ${dateFrom}`);
            }
            if (dateTo) {
                filteredPayments = filteredPayments.filter(p => p.paymentDate <= dateTo);
                 filtersDescription.push(`Hasta: ${dateTo}`);
            }
            if (verificationFilter !== 'all') {
                filteredPayments = filteredPayments.filter(p => p.status === verificationFilter);
                 filtersDescription.push(`Estado: ${verificationFilter}`);
            }

            pdfService.generatePaymentsReport(filteredPayments, 'Reporte de Pagos', filtersDescription.join(', ') || 'Ninguno');

        } else if (reportType === 'status') {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            
            let repsWithStatus = representatives.flatMap(rep => 
                rep.students.map(student => {
                    const studentPayments = payments.filter(p => p.studentId === student.id && p.month === currentMonth && p.year === currentYear && p.status === 'approved');
                    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
                    const monthlyFee = MONTHLY_FEES[student.level];
                    const pending = Math.max(0, monthlyFee - totalPaid);
                    const status = pending > 0 ? 'Moroso' : 'Solvente';
                    return {
                        cedula: rep.cedula,
                        repName: rep.fullName,
                        studentName: student.name,
                        level: student.level,
                        monthlyFee,
                        totalPaid,
                        pending,
                        status
                    };
                })
            );
            
            if (cedulaFilter) {
                repsWithStatus = repsWithStatus.filter(r => r.cedula.includes(cedulaFilter));
                filtersDescription.push(`Cédula: ${cedulaFilter}`);
            }
            if (statusFilter !== 'all') {
                const status = statusFilter === 'moroso' ? 'Moroso' : 'Solvente';
                repsWithStatus = repsWithStatus.filter(r => r.status === status);
                filtersDescription.push(`Estado: ${status}`);
            }

            pdfService.generateStatusReport(repsWithStatus, 'Reporte de Estado de Cuenta', filtersDescription.join(', ') || 'Ninguno');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Generación de Reportes</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Reporte</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                        <option value="payments">Reporte de Pagos</option>
                        <option value="status">Reporte de Estado (Solvencia)</option>
                    </select>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-600">Filtros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cédula del Representante</label>
                            <input type="text" value={cedulaFilter} onChange={e => setCedulaFilter(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                        </div>
                        {reportType === 'payments' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha Desde</label>
                                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha Hasta</label>
                                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Estado de Pago</label>
                                    <select value={verificationFilter} onChange={e => setVerificationFilter(e.target.value as VerificationFilter)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                                        <option value="all">Todos</option>
                                        <option value="approved">Aprobados</option>
                                        <option value="pending-verification">Pendientes</option>
                                        <option value="rejected">Rechazados</option>
                                    </select>
                                </div>
                            </>
                        )}
                        {reportType === 'status' && (
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Estado de Cuenta</label>
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                                    <option value="all">Todos</option>
                                    <option value="moroso">Morosos</option>
                                    <option value="solvente">Solventes</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 text-right">
                    <button onClick={handleGenerateReport} disabled={isLoading} className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300">
                        {isLoading ? <Spinner /> : 'Generar Reporte PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
