import { Multiloc } from 'typings';

import { AiAssistantFormField } from 'api/ai_assistant_tool_calls/tools/replaceFormFields';
import { ICustomFieldInputType } from 'api/custom_fields/types';

type OutlineItem =
  | { kind: 'page'; key: string; title: Multiloc; number: number }
  | { kind: 'endPage'; key: string }
  | {
      kind: 'question';
      key: string;
      title: Multiloc;
      inputType: ICustomFieldInputType;
      required: boolean;
    };

export const toOutline = (fields: AiAssistantFormField[]): OutlineItem[] => {
  const outline: OutlineItem[] = [];
  let pageNumber = 0;

  fields.forEach((field, index) => {
    // The tool's schema doesn't require an input type.
    if (!field.input_type) return;

    // New fields have no id yet.
    const key = field.id ?? `new-${index}`;
    const title = field.title_multiloc ?? {};

    if (field.input_type !== 'page') {
      outline.push({
        kind: 'question',
        key,
        title,
        inputType: field.input_type,
        required: field.required === true,
      });
    } else if (field.key === 'form_end') {
      outline.push({ kind: 'endPage', key });
    } else {
      pageNumber += 1;
      outline.push({ kind: 'page', key, title, number: pageNumber });
    }
  });

  return outline;
};
