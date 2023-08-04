import { jsPDF } from 'jspdf';
// import { saveAs } from 'file-saver';

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

const MARGIN_MM = 10;
const A4_WIDTH_MM = 210;

export async function saveSurveyToPDF(_uiSchema: Schema) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const test = `
    <div style="font-size: 40px; line-height: 50px;">
      A little bit of text. Why does it look so messed up?
      A little bit of text. Why does it look so messed up?
      A little bit of text. Why does it look so messed up?
    </div>
  `;

  doc.html(test, {
    x: MARGIN_MM,
    y: MARGIN_MM,
    width: A4_WIDTH_MM - 2 * MARGIN_MM,
    windowWidth: 793,
    callback: (doc) => {
      doc.save('survey.pdf');
    },
  });
}
