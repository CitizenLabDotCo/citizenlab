/**
 * Pure PDF builder for survey responses. All strings passed in are expected to
 * be already localized; this module contains no i18n or React concerns so it
 * stays easy to reason about and test.
 *
 * jspdf is dynamically imported (as in the insights PDF export) to keep it out
 * of the main bundle.
 */

import type { jsPDF as JsPdfDoc } from 'jspdf';

// Go Vocal brand palette, expressed as RGB tuples for jsPDF.
const C = {
  dark: [30, 21, 93],
  mid: [67, 54, 155],
  cherry: [255, 62, 82],
  l1: [240, 238, 250],
  l2: [225, 222, 245],
  l4: [150, 139, 221],
  grey: [200, 200, 200],
} as const;

export type PdfCover = {
  include: boolean;
  title: string;
  subtitle: string;
  date: string;
  preparedBy: string;
  notes: string;
};

export type PdfAnswer = { question: string; answer: string };

export type PdfRespondent = {
  label: string;
  date?: string;
  answers: PdfAnswer[];
};

type Options = {
  cover: PdfCover;
  respondents: PdfRespondent[];
  fileName: string;
  labels: { noAnswer: string; footer: string };
  // When true, only the cover page is rendered (used for the live preview, so
  // it stays byte-for-byte the same as the downloaded cover, with no response
  // data and therefore no PII).
  coverOnly?: boolean;
};

// Builds and returns the jsPDF document without saving it, so callers can
// either download it or render it to a blob for an in-UI preview.
export const buildSurveyResponsesPdf = async ({
  cover,
  respondents,
  labels,
  coverOnly = false,
}: Options): Promise<JsPdfDoc> => {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const cardPadding = 5;
  const innerWidth = contentWidth - cardPadding * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // === COVER PAGE ===
  if (cover.include) {
    doc.setFillColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.roundedRect(
      margin,
      margin,
      contentWidth,
      pageHeight - margin * 2,
      3,
      3,
      'F'
    );

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(C.cherry[0], C.cherry[1], C.cherry[2]);
    doc.text('SURVEY RESPONSE REPORT', margin + 16, margin + 24);

    // Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    y = margin + 44;
    const titleLines = doc.splitTextToSize(cover.title, contentWidth - 32);
    doc.text(titleLines, margin + 16, y);
    y += titleLines.length * 12 + 4;

    // Subtitle
    if (cover.subtitle) {
      doc.setFontSize(14);
      doc.setTextColor(220, 220, 220);
      const subtitleLines = doc.splitTextToSize(
        cover.subtitle,
        contentWidth - 32
      );
      doc.text(subtitleLines, margin + 16, y);
      y += subtitleLines.length * 8;
    }

    // Divider
    y += 16;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(margin + 16, y, margin + contentWidth - 16, y);
    y += 12;

    // Date + prepared by
    if (cover.date) {
      doc.setFontSize(7);
      doc.setTextColor(C.grey[0], C.grey[1], C.grey[2]);
      doc.text('DATE', margin + 16, y);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(cover.date, margin + 16, y + 5);
    }
    if (cover.preparedBy) {
      doc.setFontSize(7);
      doc.setTextColor(C.grey[0], C.grey[1], C.grey[2]);
      doc.text('PREPARED BY', margin + 90, y);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(cover.preparedBy, margin + 90, y + 5);
    }
    y += 16;

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(labels.footer, margin + 16, y);

    // Notes
    if (cover.notes) {
      y += 12;
      const noteLines = doc.splitTextToSize(cover.notes, contentWidth - 48);
      const noteH = noteLines.length * 4.5 + 12;
      doc.setFillColor(C.mid[0], C.mid[1], C.mid[2]);
      doc.roundedRect(margin + 12, y, contentWidth - 24, noteH, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(225, 222, 245);
      doc.text(noteLines, margin + 20, y + 7);
    }

    if (coverOnly) return doc;

    doc.addPage();
    y = margin;
  }

  // For the cover-only preview with the cover disabled, return the (blank) doc
  // rather than rendering responses.
  if (coverOnly) return doc;

  // === RESPONSE CARDS ===
  respondents.forEach((respondent) => {
    const textMaxWidth = innerWidth - 8;

    // Estimate card height for page-break handling.
    const headerH = 10;
    let cardHeight = headerH + 4;
    if (respondent.answers.length === 0) {
      cardHeight += 12;
    } else {
      respondent.answers.forEach(({ question, answer }) => {
        doc.setFontSize(7);
        const labelLines = doc.splitTextToSize(
          question.toUpperCase(),
          textMaxWidth
        );
        doc.setFontSize(9);
        const answerText = answer || labels.noAnswer;
        const answerLines = doc.splitTextToSize(answerText, textMaxWidth);
        cardHeight +=
          labelLines.length * 3.5 + 3 + (answerLines.length * 4.5 + 6) + 3;
      });
    }
    cardHeight += 4;

    ensureSpace(cardHeight + 8);
    const cardTop = y;

    // Card border
    doc.setDrawColor(C.l2[0], C.l2[1], C.l2[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cardTop, contentWidth, cardHeight, 2.5, 2.5, 'S');

    // Header bar
    doc.setFillColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.roundedRect(margin, cardTop, contentWidth, headerH + 2, 2.5, 2.5, 'F');
    doc.rect(margin, cardTop + headerH - 2, contentWidth, 4, 'F');

    const headerMidY = cardTop + headerH / 2 + 1.2;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(respondent.label, margin + cardPadding, headerMidY);

    if (respondent.date) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(C.grey[0], C.grey[1], C.grey[2]);
      doc.text(
        respondent.date,
        margin + contentWidth - cardPadding - doc.getTextWidth(respondent.date),
        headerMidY
      );
    }

    y = cardTop + headerH + 4;

    if (respondent.answers.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(C.l4[0], C.l4[1], C.l4[2]);
      doc.text(labels.noAnswer, margin + cardPadding + 2, y + 4);
      y += 12;
    } else {
      const qX = margin + cardPadding;
      const qW = innerWidth;

      respondent.answers.forEach(({ question, answer }) => {
        // Question label bar
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        const labelLines = doc.splitTextToSize(
          question.toUpperCase(),
          textMaxWidth
        );
        const qHeaderH = labelLines.length * 3.5 + 3;
        doc.setFillColor(C.l1[0], C.l1[1], C.l1[2]);
        doc.roundedRect(qX, y, qW, qHeaderH, 1.5, 1.5, 'F');
        doc.setTextColor(C.mid[0], C.mid[1], C.mid[2]);
        doc.text(labelLines, qX + 4, y + 3.5);
        y += qHeaderH;

        // Answer box
        const answerText = answer || labels.noAnswer;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const answerLines = doc.splitTextToSize(answerText, textMaxWidth);
        const answerH = answerLines.length * 4.5 + 6;
        doc.setDrawColor(C.l2[0], C.l2[1], C.l2[2]);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.2);
        doc.roundedRect(qX, y, qW, answerH, 1.5, 1.5, 'FD');
        if (answer) {
          doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        } else {
          doc.setTextColor(C.l4[0], C.l4[1], C.l4[2]);
        }
        doc.text(answerLines, qX + 4, y + 4.5);
        y += answerH + 3;
      });
    }

    y += 6;
  });

  // Footer on the final page
  doc.setFontSize(7);
  doc.setTextColor(C.l4[0], C.l4[1], C.l4[2]);
  doc.text(
    labels.footer,
    pageWidth / 2 - doc.getTextWidth(labels.footer) / 2,
    pageHeight - margin + 5
  );

  return doc;
};

// Builds the PDF and triggers a browser download.
export const generateSurveyResponsesPdf = async (options: Options) => {
  const doc = await buildSurveyResponsesPdf(options);
  doc.save(`${options.fileName}.pdf`);
};
