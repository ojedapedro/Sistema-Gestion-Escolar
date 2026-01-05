
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PaymentRegistration from './components/PaymentRegistration';
import NewStudentForm from './components/NewStudentForm';
import Reports from './components/Reports';
import Header from './components/Header';
import { SchoolDataProvider } from './hooks/useSchoolData';
import Settings from './components/Settings';
import PaymentVerification from './components/PaymentVerification';
import AccountsLedger from './components/AccountsLedger';

export type View = 'dashboard' | 'payments' | 'new-student' | 'reports' | 'settings' | 'verification' | 'ledger';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'payments':
                return <PaymentRegistration />;
            case 'new-student':
                return <NewStudentForm setCurrentView={setCurrentView} />;
            case 'reports':
                return <Reports />;
            case 'settings':
                return <Settings />;
            case 'verification':
                return <PaymentVerification />;
            case 'ledger':
                return <AccountsLedger />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <SchoolDataProvider>
            <div className="flex h-screen bg-gray-50 text-gray-800">
                <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                        {renderView()}
                    </main>
                </div>
            </div>
        </SchoolDataProvider>
    );
};

export default App;
