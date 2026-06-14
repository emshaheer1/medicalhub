function getPlainAnswer(key, value, formatDateFn) {
  if (value === null || value === undefined || value === '') return 'Not answered';
  if (key === 'createdAt' || key === 'updatedAt') return formatDateFn(value);
  return String(value);
}

function writeEntryToPdf(doc, entry, type, sections, formatDateFn, margin, maxWidth, pageHeight) {
  let y = 18;

  const title =
    type === 'registration'
      ? `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || 'Registration'
      : entry.name || 'Phlebotomy Agreement';

  const docType = type === 'registration' ? 'Course Registration Form' : 'Phlebotomy Enrollment Agreement';

  function ensureSpace(needed) {
    if (y + needed > pageHeight - 16) {
      doc.addPage();
      y = 18;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 26, 78);
  doc.text(title, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(docType, margin, y);
  y += 6;

  if (entry.course_selected) {
    doc.text(`Course: ${entry.course_selected}`, margin, y);
    y += 6;
  }

  if (entry.createdAt) {
    doc.setFontSize(9);
    doc.text(`Submitted: ${formatDateFn(entry.createdAt)}`, margin, y);
    y += 8;
  }

  doc.setDrawColor(0, 180, 216);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + maxWidth, y);
  y += 8;

  sections.forEach((section) => {
    ensureSpace(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 150, 199);
    doc.text(section.title, margin, y);
    y += 8;

    section.fields.forEach((field) => {
      const answer = getPlainAnswer(field.key, entry[field.key], formatDateFn);
      const questionLines = doc.splitTextToSize(field.label, maxWidth);
      const answerLines = doc.splitTextToSize(answer, maxWidth);
      const blockHeight = questionLines.length * 4.5 + answerLines.length * 5 + 6;

      ensureSpace(blockHeight);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(questionLines, margin, y);
      y += questionLines.length * 4.5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(answerLines, margin, y);
      y += answerLines.length * 5 + 5;
    });

    y += 3;
  });

  return y;
}

function generateEntryPdf(entry, type, sections, formatDateFn) {
  if (!window.jspdf) {
    alert('PDF library failed to load. Please refresh the page.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  const maxWidth = 182;
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 78);
  doc.text('Medical Training Hub', margin, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${formatDateFn(new Date().toISOString())}`, margin, 26);

  writeEntryToPdf(doc, entry, type, sections, formatDateFn, margin, maxWidth, pageHeight);

  const safeName = (type === 'registration' ? entry.last_name || entry.first_name : entry.name) || 'entry';
  const filename = `MTH-${type}-${safeName}-${Date.now()}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '-');
  doc.save(filename);
}

function generateAllRegistrationsPdf(entries, sections, formatDateFn) {
  if (!window.jspdf) {
    alert('PDF library failed to load. Please refresh the page.');
    return;
  }

  if (!entries.length) {
    alert('No registrations to export.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  const maxWidth = 182;
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(26, 26, 78);
  doc.text('Medical Training Hub', margin, 30);
  doc.setFontSize(14);
  doc.text('All Course Registrations', margin, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Entries: ${entries.length}`, margin, 52);
  doc.text(`Generated: ${formatDateFn(new Date().toISOString())}`, margin, 60);

  entries.forEach((entry, index) => {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 150, 199);
    doc.text(`Entry ${index + 1} of ${entries.length}`, margin, 12);
    writeEntryToPdf(doc, entry, 'registration', sections, formatDateFn, margin, maxWidth, pageHeight);
  });

  const filename = `MTH-All-Registrations-${Date.now()}.pdf`;
  doc.save(filename);
}
