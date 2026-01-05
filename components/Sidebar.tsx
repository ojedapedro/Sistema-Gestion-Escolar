
import React from 'react';
import { View } from '../App';
import DashboardIcon from './icons/DashboardIcon';
import DollarSignIcon from './icons/DollarSignIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import BarChartIcon from './icons/BarChartIcon';
import SettingsIcon from './icons/SettingsIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
    view: View;
    label: string;
    currentView: View;
    setCurrentView: (view: View) => void;
    children: React.ReactNode;
}> = ({ view, label, currentView, setCurrentView, children }) => (
    <button
        onClick={() => setCurrentView(view)}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 transform rounded-lg ${
            currentView === view
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {children}
        <span className="mx-4">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    return (
        <aside className="hidden md:flex flex-col w-64 h-screen px-4 py-8 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l">
            <div className="text-center">
                <img src="https://i.ibb.co/FbHJbvVT/images.png" alt="Logo Institucional" className="w-20 h-20 mx-auto mb-2 rounded-full" />
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                    Gestión Escolar
                </h2>
            </div>


            <div className="flex flex-col justify-between flex-1 mt-10 space-y-2">
                <nav>
                    <NavItem view="dashboard" label="Dashboard" currentView={currentView} setCurrentView={setCurrentView}>
                        <DashboardIcon className="w-5 h-5" />
                    </NavItem>
                    <NavItem view="payments" label="Registrar Pago" currentView={currentView} setCurrentView={setCurrentView}>
                        <DollarSignIcon className="w-5 h-5" />
                    </NavItem>
                    <NavItem view="new-student" label="Nuevo Alumno" currentView={currentView} setCurrentView={setCurrentView}>
                        <UserPlusIcon className="w-5 h-5" />
                    </NavItem>
                    <div className="border-t my-4"></div>
                     <NavItem view="verification" label="Verificación de Pagos" currentView={currentView} setCurrentView={setCurrentView}>
                        <CheckCircleIcon className="w-5 h-5" />
                    </NavItem>
                     <NavItem view="ledger" label="Libro de Cuentas" currentView={currentView} setCurrentView={setCurrentView}>
                        <BookOpenIcon className="w-5 h-5" />
                    </NavItem>
                     <NavItem view="reports" label="Reportes" currentView={currentView} setCurrentView={setCurrentView}>
                        <BarChartIcon className="w-5 h-5" />
                    </NavItem>
                    <div className="border-t my-4"></div>
                    <NavItem view="settings" label="Configuración" currentView={currentView} setCurrentView={setCurrentView}>
                        <SettingsIcon className="w-5 h-5" />
                    </NavItem>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
