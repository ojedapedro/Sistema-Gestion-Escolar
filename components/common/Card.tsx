
import React from 'react';

interface CardProps {
    title: string;
    value: string;
    description: string;
}

const Card: React.FC<CardProps> = ({ title, value, description }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
    );
};

export default Card;
