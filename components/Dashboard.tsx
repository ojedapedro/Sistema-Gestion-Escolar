
import React, { useEffect } from 'react';
import Card from './common/Card';
import { useSchoolData } from '../hooks/useSchoolData';

const Dashboard: React.FC = () => {
    const { exchangeRate, pendingPayments, fetchPendingPayments } = useSchoolData();

    useEffect(() => {
        fetchPendingPayments();
    }, [fetchPendingPayments]);

    const dailyPaymentsUSD = 3450;
    const dailyPaymentsBS = (dailyPaymentsUSD * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const paymentsValue = `$ ${dailyPaymentsUSD.toLocaleString('en-US')}`;
    const paymentsDescription = `Total recaudado (Bs. ${dailyPaymentsBS})`;


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card title="Alumnos Activos" value="258" description="Total de alumnos matriculados." />
                 <Card title="Pagos Hoy" value={paymentsValue} description={paymentsDescription} />
                 <Card title="Tasa de Morosidad" value="12%" description="Alumnos con pagos pendientes." />
                 <Card title="Pagos por Verificar" value={pendingPayments.length.toString()} description="Pagos electrónicos pendientes de verificación." />
            </div>

            <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Bienvenido al Sistema de Gestión Escolar</h2>
                <p className="text-gray-600">
                    Utilice el menú de la izquierda para navegar por las diferentes secciones del sistema. Puede registrar pagos,
                    inscribir nuevos alumnos y generar reportes detallados.
                </p>
                <p className="mt-4 text-gray-600">
                   Este panel principal le ofrece una vista rápida de las métricas más importantes del colegio.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
