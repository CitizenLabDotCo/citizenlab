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

export async function saveSurveyToPDF(uiSchema: Schema) {
  for (const page of uiSchema.elements) {
    if (page.elements.length === 0) continue;

    for (const question of page.elements) {
      console.log(question);
    }
  }

  // saveAs(blob, 'survey.pdf');
}
