import React from 'react';

import { AiAssistantFormField } from 'api/ai_assistant_tool_calls/tools/replaceFormFields';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

import { render, screen } from 'utils/testUtils/rtl';

import FormOutlinePreview from './FormOutlinePreview';

const toolCall = (
  fields: AiAssistantFormField[]
): IAiAssistantToolCallData => ({
  id: 'call-1',
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'replace_form_fields',
    arguments: { fields },
    status: 'awaiting_user',
    reason: null,
    decided_at: null,
    created_at: '2026-10-15T10:00:00Z',
  },
});

describe('FormOutlinePreview', () => {
  it('outlines the proposed pages and questions', () => {
    render(
      <FormOutlinePreview
        toolCall={toolCall([
          { input_type: 'page', title_multiloc: { en: 'Your park' } },
          {
            id: 'field-1',
            input_type: 'select',
            title_multiloc: { en: 'How often do you visit?' },
            required: true,
          },
          { input_type: 'page', key: 'form_end', title_multiloc: {} },
        ])}
      />
    );

    expect(screen.getByText('1 page, 1 question')).toBeInTheDocument();
    expect(screen.getByText('Your park')).toBeInTheDocument();
    expect(screen.getByText('How often do you visit?')).toBeInTheDocument();
    expect(screen.getByText('End page')).toBeInTheDocument();
  });

  it('numbers untitled pages without counting the end page', () => {
    render(
      <FormOutlinePreview
        toolCall={toolCall([
          { input_type: 'page' },
          { input_type: 'text' },
          { input_type: 'page' },
          { input_type: 'page', key: 'form_end' },
        ])}
      />
    );

    expect(screen.getByText('2 pages, 1 question')).toBeInTheDocument();
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 2')).toBeInTheDocument();
    expect(screen.getByText('End page')).toBeInTheDocument();
  });

  it('leaves out fields without an input type', () => {
    render(<FormOutlinePreview toolCall={toolCall([{ id: 'field-1' }])} />);

    expect(screen.getByText('0 pages, 0 questions')).toBeInTheDocument();
  });
});
