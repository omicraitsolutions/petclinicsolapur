import { jsPDF } from 'jspdf';
import type { ClinicSettings, InvoiceItem } from '../types';
import type { FormTemplateDef, FormValues } from '../types/forms';

export const exportReportToPDF = (
  title: string,
  sections: { title: string; content: (string | [string, string])[] }[],
  clinicName: string = 'Pet Hospital Solapur'
) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 107, 99); // #0F6B63
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(clinicName || 'Pet Hospital Solapur', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 25);

  let yPosition = 45;

  // Title
  doc.setTextColor(15, 107, 99);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, yPosition);
  yPosition += 10;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPosition, 196, yPosition);
  yPosition += 10;

  // Sections
  sections.forEach(section => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    section.content.forEach(item => {
      if (yPosition > 275) {
        doc.addPage();
        yPosition = 20;
      }

      if (Array.isArray(item)) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${item[0]}:`, 18, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item[1]}`, 65, yPosition);
      } else {
        doc.text(item, 18, yPosition);
      }
      yPosition += 7;
    });

    yPosition += 5;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${clinicName || 'Pet Hospital Solapur'} | Confidential Medical Record | Page ${i} of ${pageCount}`,
      14,
      285
    );
  }

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

// ---------------------------------------------------------------------
// Bill Receipt — replicates the clinic's physical bill book layout:
// logo + clinic name + doctor details header, numbered service list with
// amounts, total, and a signature line.
// ---------------------------------------------------------------------
export const exportInvoiceToPDF = (invoice: InvoiceItem, clinic: ClinicSettings) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const marginX = 16;

  // Dashed top border (matches the perforated bill-book edge)
  doc.setDrawColor(150, 150, 150);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(marginX, 14, pageWidth - marginX, 14);
  doc.setLineDashPattern([], 0);

  // Logo (top-left, circular clinic seal)
  const logoSize = 22;
  const logoX = marginX;
  const logoY = 18;
  if (clinic.logoUrl && clinic.logoUrl.startsWith('data:image')) {
    try {
      const format = clinic.logoUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(clinic.logoUrl, format, logoX, logoY, logoSize, logoSize);
    } catch {
      // If the image fails to embed, silently continue without it.
    }
  }

  const headerCenterX = pageWidth / 2;
  const doctorBlockX = pageWidth - marginX;

  // Clinic name — centered across the page (constrained width so long
  // names wrap instead of colliding with the logo/doctor block)
  doc.setTextColor(200, 30, 40);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text((clinic.clinicName || 'Pet Hospital').toUpperCase(), headerCenterX, 26, {
    align: 'center',
    maxWidth: 108
  });

  // MSVC Reg No — centered, just under the clinic name
  if (clinic.regNo) {
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`MSVC Reg. No- ${clinic.regNo}`, headerCenterX, 31, { align: 'center' });
  }

  // Doctor name + qualification + mobile — right-aligned
  doc.setTextColor(90, 30, 120);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(clinic.doctorName || '', doctorBlockX, 22, { align: 'right' });

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  if (clinic.doctorQualification) {
    doc.text(clinic.doctorQualification, doctorBlockX, 27, { align: 'right' });
  }
  if (clinic.phone) {
    doc.text(`Mob. : ${clinic.phone}`, doctorBlockX, 32, { align: 'right' });
  }

  doc.setDrawColor(30, 30, 30);
  doc.line(marginX, 42, pageWidth - marginX, 42);

  // "Bill Receipt" on the left; Invoice No + Date stacked on the right
  let y = 50;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text('Bill Receipt', marginX, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - marginX, y - 3, { align: 'right' });
  doc.text(`Date : ${invoice.date}`, pageWidth - marginX, y + 2, { align: 'right' });

  y += 4;
  doc.setDrawColor(180, 180, 180);
  doc.line(marginX, y, pageWidth - marginX, y);

  // Pet & owner reference line
  y += 7;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Pet: ${invoice.petName}    Owner: ${invoice.ownerName}`, marginX, y);

  // Itemized rows
  y += 8;
  const rowHeight = 8.6;
  doc.setFontSize(10.5);
  invoice.items.forEach((item, idx) => {
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`${idx + 1}) ${item.label}`, marginX, y);
    doc.text(':', marginX + 78, y);
    if (item.amount > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrencyPlain(item.amount), pageWidth - marginX, y, { align: 'right' });
    }
    doc.setDrawColor(225, 225, 225);
    doc.line(marginX, y + 2.2, pageWidth - marginX, y + 2.2);
    y += rowHeight;
  });

  // Total
  y += 2;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 30, 40);
  doc.text('Total =', marginX, y);
  doc.text(formatCurrencyPlain(invoice.totalAmount), pageWidth - marginX, y, { align: 'right' });

  doc.setDrawColor(30, 30, 30);
  doc.line(marginX, y + 3, pageWidth - marginX, y + 3);

  // Payment method / status
  y += 11;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Payment Method: ${invoice.paymentMethod}    Status: ${invoice.status}`, marginX, y);

  // Signature
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(40, 40, 90);
  doc.text('Signature', pageWidth - marginX - 30, y + 20);

  // Address footer
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text(`(${clinic.address || ''})`, marginX, 285);

  doc.save(`${invoice.invoiceNumber}_${invoice.petName}.pdf`);
};

function formatCurrencyPlain(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

// =======================================================================
// Generic medical form -> PDF renderer.
//
// Works for all 6 form templates from one function: prints the clinic
// header, then walks each section's fields printing "Label: value" pairs
// (wrapping long text and checkbox groups sensibly), then any consent
// notice text, then signature lines. This keeps every form template
// visually consistent without hand-building a PDF layout per template.
// =======================================================================
export const exportFormToPDF = (template: FormTemplateDef, values: FormValues, clinic: ClinicSettings) => {
  const doc = buildFormDoc(template, values, clinic);
  doc.save(formPdfFileName(template, values));
};

// Same rendering, but returns a File instead of triggering a download --
// used by the Share action to attach the actual PDF via the Web Share API.
export const generateFormPdfFile = (template: FormTemplateDef, values: FormValues, clinic: ClinicSettings): File => {
  const doc = buildFormDoc(template, values, clinic);
  const blob = doc.output('blob');
  return new File([blob], formPdfFileName(template, values), { type: 'application/pdf' });
};

function formPdfFileName(template: FormTemplateDef, values: FormValues): string {
  const fileSafeTitle = template.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const petName = values.petName ? `_${values.petName.replace(/[^a-zA-Z0-9]+/g, '_')}` : '';
  return `${fileSafeTitle}${petName}.pdf`;
}

function buildFormDoc(template: FormTemplateDef, values: FormValues, clinic: ClinicSettings): jsPDF {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  let y = 18;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 18;
    }
  };

  // ---- Clinic header (logo left, clinic name centered, doctor block right) ----
  const logoSize = 16;
  if (clinic.logoUrl && clinic.logoUrl.startsWith('data:image')) {
    try {
      const format = clinic.logoUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(clinic.logoUrl, format, marginX, y, logoSize, logoSize);
    } catch {
      // Continue without the logo if it fails to embed.
    }
  }

  doc.setTextColor(200, 30, 40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text((clinic.clinicName || 'Pet Hospital').toUpperCase(), pageWidth / 2, y + 5.5, {
    align: 'center',
    maxWidth: 108
  });

  doc.setTextColor(90, 30, 120);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(clinic.doctorName || '', pageWidth - marginX, y + 3.5, { align: 'right' });
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  if (clinic.doctorQualification) {
    doc.text(clinic.doctorQualification, pageWidth - marginX, y + 8, { align: 'right' });
  }
  if (clinic.phone) {
    doc.text(`Mob. : ${clinic.phone}`, pageWidth - marginX, y + 11.5, { align: 'right' });
  }

  y += logoSize + 3;
  doc.setDrawColor(30, 30, 30);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 6.5;

  // ---- Form title (boxed, matching the clinic's own paper forms) ----
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const titleText = template.title.toUpperCase();
  const titleWidth = doc.getTextWidth(titleText);
  const boxPaddingX = 5;
  const boxWidth = titleWidth + boxPaddingX * 2;
  const boxHeight = 8;
  const boxX = pageWidth / 2 - boxWidth / 2;
  const boxY = y - 5.5;
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.4);
  doc.rect(boxX, boxY, boxWidth, boxHeight);
  doc.text(titleText, pageWidth / 2, y, { align: 'center' });
  doc.setLineWidth(0.2);

  // DATE at top-right of the title row, matching the reference forms.
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text(`DATE: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - marginX, y - 1, { align: 'right' });

  y += 8 + 4.5;

  // ---- Sections ----
  // Fields are packed two-per-row (like the clinic's own paper forms)
  // unless a field is explicitly full-width (span: 2) or is a textarea/
  // checkbox group, which always gets its own full-width row.
  const contentWidth = pageWidth - marginX * 2;
  const colGap = 6;
  const colWidth = (contentWidth - colGap) / 2;
  const rightX = marginX + colWidth + colGap;
  const fieldFontSize = 8;
  const fieldLineHeight = 4.2;
  const rowGap = 1.6;

  const isFullWidthField = (field: (typeof template.sections)[number]['fields'][number]) =>
    field.span === 2 || field.type === 'textarea' || field.type === 'checkboxGroup';

  const renderFieldAt = (
    field: (typeof template.sections)[number]['fields'][number],
    x: number,
    maxWidth: number
  ): number => {
    const rawValue = values[field.key] || '';
    const displayValue = field.type === 'yesno' ? rawValue || 'Not answered' : rawValue || '—';

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(fieldFontSize);
    const labelText = `${field.label}: `;
    const labelLines = doc.splitTextToSize(labelText, maxWidth);
    doc.text(labelLines, x, y);
    // Measure while still in bold -- the font actually used to render
    // the label -- otherwise longer bold labels (which are wider than
    // the same text in normal weight) get measured too narrow and the
    // value ends up overlapping the label with no visible gap.
    const labelWidthBold = doc.getTextWidth(labelText);

    // Single-line label (the common case): print the value right after it
    // on the same line. Long labels that wrap onto 2+ lines print the
    // value starting on its own line below, so it never overlaps.
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    if (labelLines.length === 1) {
      // jsPDF's getTextWidth doesn't reliably include trailing space
      // width, so without an explicit gap the value ends up butted
      // right up against the label. Add a small fixed gap on top of the
      // (now correctly-measured) label width.
      const labelWidth = labelWidthBold + 1.8;
      const valueLines = doc.splitTextToSize(displayValue, Math.max(maxWidth - labelWidth, 20));
      doc.text(valueLines, x + labelWidth, y);
      return Math.max(labelLines.length, valueLines.length) * fieldLineHeight;
    }
    const valueLines = doc.splitTextToSize(displayValue, maxWidth);
    doc.text(valueLines, x, y + labelLines.length * fieldLineHeight);
    return (labelLines.length + valueLines.length) * fieldLineHeight;
  };

  doc.setFontSize(9.5);
  for (const section of template.sections) {
    ensureSpace(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 107, 99);
    doc.setFontSize(9.5);
    doc.text(section.title, marginX, y);
    y += 1.2;
    doc.setDrawColor(200, 225, 220);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 5;

    const fields = section.fields;
    let i = 0;
    while (i < fields.length) {
      const field = fields[i];
      if (isFullWidthField(field)) {
        ensureSpace(fieldLineHeight * 3);
        const usedHeight = renderFieldAt(field, marginX, contentWidth);
        y += usedHeight + rowGap;
        i += 1;
        continue;
      }

      const next = fields[i + 1];
      const nextIsPairable = next && !isFullWidthField(next);

      ensureSpace(fieldLineHeight * 3);
      const leftHeight = renderFieldAt(field, marginX, colWidth);
      let rowHeight = leftHeight;
      if (nextIsPairable) {
        const rightHeight = renderFieldAt(next, rightX, colWidth);
        rowHeight = Math.max(leftHeight, rightHeight);
        i += 2;
      } else {
        i += 1;
      }
      y += rowHeight + rowGap;
    }
    y += 2;
  }

  // ---- Consent / certification notice ----
  if (template.noticeText) {
    ensureSpace(16);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.3);
    doc.setTextColor(50, 50, 50);
    const noticeLines = doc.splitTextToSize(template.noticeText, contentWidth);
    ensureSpace(noticeLines.length * 4.3 + 5);
    doc.text(noticeLines, marginX, y);
    y += noticeLines.length * 4.3 + 6;
  }

  // ---- Signatures ----
  const sigLabels: string[] = [];
  if (template.signatures.owner) sigLabels.push('Owner / Guardian Signature');
  if (template.signatures.veterinarian) sigLabels.push('Veterinarian Signature');
  if (template.signatures.groomer) sigLabels.push('Groomer Signature');

  if (sigLabels.length > 0) {
    ensureSpace(22);
    y += 5;
    const colWidth = (pageWidth - marginX * 2) / sigLabels.length;
    sigLabels.forEach((label, idx) => {
      const x = marginX + idx * colWidth;
      doc.setDrawColor(120, 120, 120);
      doc.line(x, y, x + colWidth - 10, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text(label, x, y + 5);
      doc.text('Date: _______________', x, y + 11);
    });
  }

  return doc;
}