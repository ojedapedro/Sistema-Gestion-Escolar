
import React, { useState, useEffect } from 'react';
import { useSchoolData } from '../hooks/useSchoolData';
import { Level } from '../types';
import { SCHOOL_LEVELS, GRADES_BY_LEVEL } from '../constants';
import { View } from '../App';
import Spinner from './common/Spinner';

interface NewStudentFormProps {
    setCurrentView: (view: View) => void;
}

const NewStudentForm: React.FC<NewStudentFormProps> = ({ setCurrentView }) => {
    const { addStudent, isLoading, error } = useSchoolData();
    const [repCedula, setRepCedula] = useState('');
    const [repName, setRepName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [studentName, setStudentName] = useState('');
    const [level, setLevel] = useState<Level>(Level.MATERNAL);
    const [grade, setGrade] = useState(GRADES_BY_LEVEL[Level.MATERNAL][0]);
    const [section, setSection] = useState('');
    const [matricula, setMatricula] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (repCedula) {
            const currentYear = new Date().getFullYear();
            const schoolYear = `${currentYear + 1}-${String(currentYear + 2).slice(2)}`;
            setMatricula(`mat-${schoolYear}-${repCedula}`);
        } else {
            setMatricula('');
        }
    }, [repCedula]);

    useEffect(() => {
        setGrade(GRADES_BY_LEVEL[level][0]);
    }, [level]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        const result = await addStudent({
            repCedula: repCedula.trim(),
            repName: repName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            studentName: studentName.trim(),
            level,
            grade,
            section: section.trim().toUpperCase()
        });
        if (result) {
            setSuccessMessage(`¡Alumno registrado con éxito bajo la matrícula ${result.matricula}!`);
            // Reset form
            setRepCedula('');
            setRepName('');
            setPhone('');
            setEmail('');
            setAddress('');
            setStudentName('');
            setLevel(Level.MATERNAL);
            setSection('');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Inscripción de Nuevo Alumno</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
                {successMessage && (
                    <div className="mb-6 p-4 text-center text-green-800 bg-green-100 rounded-lg">
                        {successMessage}
                        <button onClick={() => setCurrentView('payments')} className="ml-4 font-bold underline">Registrar un pago</button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-700">Datos del Representante</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cédula</label>
                                <input type="text" value={repCedula} onChange={(e) => setRepCedula(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre y Apellido</label>
                                <input type="text" value={repName} onChange={(e) => setRepName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                         <div className="mt-4">
                             <label className="block text-sm font-medium text-gray-700">Dirección</label>
                             <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="mt-4">
                             <label className="block text-sm font-medium text-gray-700">Matrícula (generada automáticamente)</label>
                             <input type="text" value={matricula} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-700">Datos del Alumno</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre y Apellido</label>
                                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Nivel</label>
                                <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
                                    {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Grado/Año</label>
                                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
                                    {GRADES_BY_LEVEL[level].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Sección</label>
                                <input type="text" value={section} onChange={(e) => setSection(e.target.value)} required maxLength={1} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                    </div>
                     {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                    <div className="pt-4 text-right">
                        <button type="submit" disabled={isLoading} className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                             {isLoading ? <Spinner /> : 'Registrar Alumno'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewStudentForm;
