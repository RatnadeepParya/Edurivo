const PDFDocument = require('pdfkit');

/**
 * Enterprise PDF Generator for Receipts, Marksheets & ID Cards
 */
class PdfGenerator {
  /**
   * Generates a printable, professional Fee Receipt PDF
   * Returns a Buffer
   */
  static async generateReceiptPdf(receipt, school) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header / School Branding
        doc.fontSize(20).font('Helvetica-Bold').text(school.name || 'Edurivo International School', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(school.address || 'Academic City, Metropolis', { align: 'center' });
        doc.text(`Phone: ${school.phone || 'N/A'} | Email: ${school.email || 'N/A'}`, { align: 'center' });
        doc.moveDown();
        doc.strokeColor('#3b82f6').lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown();

        // Title
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('FEE PAYMENT RECEIPT', { align: 'center' });
        doc.moveDown();

        // Receipt Meta Information Grid
        const startY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
        
        // Column 1
        doc.text(`Receipt No:`, 40, startY);
        doc.font('Helvetica').text(receipt.receiptNumber, 120, startY);
        doc.font('Helvetica-Bold').text(`Date:`, 40, startY + 18);
        doc.font('Helvetica').text(receipt.date || new Date().toISOString().split('T')[0], 120, startY + 18);
        doc.font('Helvetica-Bold').text(`Payment Mode:`, 40, startY + 36);
        doc.font('Helvetica').text(receipt.paymentMethod, 120, startY + 36);
        doc.font('Helvetica-Bold').text(`Transaction Ref:`, 40, startY + 54);
        doc.font('Helvetica').text(receipt.transactionReference || 'N/A', 120, startY + 54);

        // Column 2
        doc.font('Helvetica-Bold').text(`Student Name:`, 320, startY);
        doc.font('Helvetica').text(receipt.studentName, 410, startY);
        doc.font('Helvetica-Bold').text(`Admission No:`, 320, startY + 18);
        doc.font('Helvetica').text(receipt.admissionNumber, 410, startY + 18);
        doc.font('Helvetica-Bold').text(`Class & Section:`, 320, startY + 36);
        doc.font('Helvetica').text(`${receipt.className || 'N/A'} - ${receipt.sectionName || 'N/A'}`, 410, startY + 36);
        doc.font('Helvetica-Bold').text(`Cashier:`, 320, startY + 54);
        doc.font('Helvetica').text(receipt.cashierName || 'System', 410, startY + 54);

        doc.y = startY + 80;
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.rect(40, tableTop, 515, 24).fill('#f1f5f9');
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10);
        doc.text('SL', 50, tableTop + 7);
        doc.text('Fee Component / Description', 100, tableTop + 7);
        doc.text('Amount Paid ($)', 450, tableTop + 7, { align: 'right' });

        // Table Items
        let currentY = tableTop + 26;
        doc.font('Helvetica').fontSize(10);

        const items = receipt.items && receipt.items.length ? receipt.items : [
          { name: receipt.feeTitle || 'Tuition Fee Payment', amount: receipt.amountPaid }
        ];

        items.forEach((item, index) => {
          doc.fillColor('#334155');
          doc.text(`${index + 1}`, 50, currentY + 5);
          doc.text(item.name || item.componentName || 'Fee Component', 100, currentY + 5);
          doc.text(`$${Number(item.amount || item.amountPaid).toFixed(2)}`, 450, currentY + 5, { align: 'right' });
          currentY += 24;
          doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, currentY).lineTo(555, currentY).stroke();
        });

        // Totals Box
        currentY += 10;
        doc.rect(300, currentY, 255, 60).fill('#f8fafc');
        doc.fillColor('#0f172a').font('Helvetica-Bold');
        doc.text('Total Amount Paid:', 310, currentY + 12);
        doc.text(`$${Number(receipt.amountPaid).toFixed(2)}`, 450, currentY + 12, { align: 'right' });

        if (receipt.remainingBalance !== undefined) {
          doc.font('Helvetica').fontSize(9).fillColor('#64748b');
          doc.text('Remaining Outstanding Balance:', 310, currentY + 34);
          doc.text(`$${Number(receipt.remainingBalance).toFixed(2)}`, 450, currentY + 34, { align: 'right' });
        }

        // Footer & Signature Area
        const footerY = 700;
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, footerY).lineTo(200, footerY).stroke();
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(395, footerY).lineTo(555, footerY).stroke();

        doc.fontSize(9).font('Helvetica').fillColor('#64748b');
        doc.text('Authorized Signature', 60, footerY + 8);
        doc.text('Parent / Payer Signature', 415, footerY + 8);

        doc.text('This is a computer generated official fee receipt. Retain this for your tax and school records.', 40, 750, { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates a printable, official Mark Sheet / Report Card PDF
   */
  static async generateMarksheetPdf(result, student, exam, school) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // School Header
        doc.fontSize(20).font('Helvetica-Bold').text(school.name, { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(school.address, { align: 'center' });
        doc.moveDown();
        doc.strokeColor('#2563eb').lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text(`OFFICIAL GRADE REPORT - ${exam.name.toUpperCase()}`, { align: 'center' });
        doc.moveDown();

        // Student Info
        const startY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
        doc.text('Student Name:', 40, startY);
        doc.font('Helvetica').text(`${student.firstName} ${student.lastName}`, 130, startY);
        doc.font('Helvetica-Bold').text('Admission No:', 40, startY + 18);
        doc.font('Helvetica').text(student.admissionNumber, 130, startY + 18);
        doc.font('Helvetica-Bold').text('Roll Number:', 40, startY + 36);
        doc.font('Helvetica').text(student.rollNumber || 'N/A', 130, startY + 36);

        doc.font('Helvetica-Bold').text('Class / Section:', 320, startY);
        doc.font('Helvetica').text(`${student.className || 'Class 10'} (${student.sectionName || 'A'})`, 420, startY);
        doc.font('Helvetica-Bold').text('Session:', 320, startY + 18);
        doc.font('Helvetica').text(school.currentSessionName || '2025-26', 420, startY + 18);
        doc.font('Helvetica-Bold').text('Date of Issue:', 320, startY + 36);
        doc.font('Helvetica').text(new Date().toISOString().split('T')[0], 420, startY + 36);

        doc.y = startY + 60;
        doc.moveDown();

        // Marks Table
        const tableTop = doc.y;
        doc.rect(40, tableTop, 515, 24).fill('#f1f5f9');
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10);
        doc.text('Subject', 50, tableTop + 7);
        doc.text('Max Marks', 230, tableTop + 7, { align: 'center' });
        doc.text('Pass Marks', 320, tableTop + 7, { align: 'center' });
        doc.text('Marks Obtained', 410, tableTop + 7, { align: 'center' });
        doc.text('Grade', 500, tableTop + 7, { align: 'center' });

        let currentY = tableTop + 26;
        doc.font('Helvetica').fontSize(10);

        (result.subjects || []).forEach((sub) => {
          doc.fillColor('#334155');
          doc.text(sub.subjectName, 50, currentY + 5);
          doc.text(String(sub.maxMarks), 230, currentY + 5, { align: 'center' });
          doc.text(String(sub.passMarks), 320, currentY + 5, { align: 'center' });
          doc.text(String(sub.obtainedMarks), 410, currentY + 5, { align: 'center' });
          doc.text(sub.grade || '-', 500, currentY + 5, { align: 'center' });
          currentY += 24;
          doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, currentY).lineTo(555, currentY).stroke();
        });

        // Summary Box
        currentY += 15;
        doc.rect(40, currentY, 515, 65).fill('#f8fafc');
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10);
        doc.text(`Total Marks: ${result.totalObtained} / ${result.totalMax}`, 60, currentY + 12);
        doc.text(`Percentage: ${result.percentage}%`, 240, currentY + 12);
        doc.text(`Overall Grade: ${result.overallGrade}`, 400, currentY + 12);

        const statusColor = result.status === 'PASS' ? '#16a34a' : '#dc2626';
        doc.fillColor(statusColor).fontSize(12).text(`Result Status: ${result.status}`, 60, currentY + 36);

        // Signatures
        const footerY = 700;
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, footerY).lineTo(180, footerY).stroke();
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(240, footerY).lineTo(370, footerY).stroke();
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(420, footerY).lineTo(550, footerY).stroke();

        doc.fontSize(9).font('Helvetica').fillColor('#64748b');
        doc.text('Class Teacher', 70, footerY + 8);
        doc.text('Exam Controller', 260, footerY + 8);
        doc.text('Principal', 460, footerY + 8);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = PdfGenerator;
