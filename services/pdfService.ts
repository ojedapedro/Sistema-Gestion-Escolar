
import { Payment, Representative } from '../types';
declare const jspdf: any;

const statusTranslations = {
    'approved': 'Aprobado',
    'pending-verification': 'Pendiente',
    'rejected': 'Rechazado',
};

class PdfService {
    generatePaymentsReport(payments: Payment[], title: string, filters: string) {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(10);
        doc.text(`Filtros aplicados: ${filters}`, 14, 30);
        doc.setFontSize(8);
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 35);


        const tableColumn = ["Fecha Pago", "Cédula Rep.", "Representante", "Matrícula", "Monto", "Método", "Referencia", "Estado"];
        const tableRows: (string | number)[][] = [];

        payments.forEach(payment => {
            const paymentData = [
                payment.paymentDate,
                payment.representativeCedula,
                payment.representativeName,
                payment.matricula,
                `$${payment.amount.toFixed(2)}`,
                payment.paymentMethod,
                payment.reference || 'N/A',
                statusTranslations[payment.status] || payment.status
            ];
            tableRows.push(paymentData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [22, 160, 133] }
        });

        doc.save(`reporte_pagos_${Date.now()}.pdf`);
    }

     generateStatusReport(repsWithStatus: any[], title: string, filters: string) {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(10);
        doc.text(`Filtros aplicados: ${filters}`, 14, 30);
        doc.setFontSize(8);
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 35);


        const tableColumn = ["Cédula Rep.", "Representante", "Estudiante", "Nivel", "Mensualidad", "Pagado", "Deuda", "Estado"];
        const tableRows: (string | number)[][] = [];

        repsWithStatus.forEach(item => {
             const reportData = [
                item.cedula,
                item.repName,
                item.studentName,
                item.level,
                `$${item.monthlyFee.toFixed(2)}`,
                `$${item.totalPaid.toFixed(2)}`,
                `$${item.pending.toFixed(2)}`,
                item.status,
            ];
            tableRows.push(reportData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            didParseCell: function (data: any) {
                if (data.row.section === 'body' && data.column.dataKey === 7) { // Status column
                    if (data.cell.raw === 'Moroso') {
                        data.cell.styles.textColor = [231, 76, 60];
                    }
                    if (data.cell.raw === 'Solvente') {
                        data.cell.styles.textColor = [39, 174, 96];
                    }
                }
            }
        });

        doc.save(`reporte_estado_cuenta_${Date.now()}.pdf`);
    }
}

export const pdfService = new PdfService();
