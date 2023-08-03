import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface Schema {
  type: 'Categorization';
  elements: Page[];
  options: {
    formId: string;
    inputTerm: string;
  };
}

interface Page {
  type: 'Page';
  options: {
    input_type: 'page';
    id: string;
    title: string;
    description: string;
  };
  elements: Question[];
}

interface Question {
  type: 'Control';
  scope: string;
  label: string;
  options: {
    description: string;
    input_type: 'select' | 'multiselect' | 'text' | 'multiline_text';
    isAdminField: boolean;
    hasRule: boolean;
    enumNames?: string[];
    transform?: 'trim_on_blur';
    textarea?: boolean;
  };
}

// const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_MARGIN_MM = 10;

function mmToPixels(mm: number) {
  return mm * 3.7795;
}

const FONT_SIZE_PX = 24;

const LEFT_TOP_PX = mmToPixels(A4_HEIGHT_MM - A4_MARGIN_MM) - FONT_SIZE_PX;
console.log(LEFT_TOP_PX);

export async function saveSurveyToPDF(uiSchema: Schema) {
  const pdfDoc = await PDFDocument.create();

  for (const page of uiSchema.elements) {
    if (page.elements.length === 0) continue;

    const pdfPage = pdfDoc.addPage();

    for (const question of page.elements) {
      pdfPage.moveTo(mmToPixels(A4_MARGIN_MM), LEFT_TOP_PX);
      pdfPage.drawText(question.label);
    }
  }

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes.buffer], { type: 'application/pdf' });

  saveAs(blob, 'survey.pdf');
}
