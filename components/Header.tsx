
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="relative z-10 items-center w-full h-16 bg-white shadow-md">
            <div className="relative flex items-center justify-center h-full px-6 mx-auto text-gray-900">
                <h1 className="text-xl font-semibold">Sistema de Gestión Administrativa</h1>
            </div>
        </header>
    );
};

export default Header;
