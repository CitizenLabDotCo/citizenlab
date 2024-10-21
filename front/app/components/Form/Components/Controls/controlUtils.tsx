import React from 'react';

import { ControlElement, JsonSchema } from '@jsonforms/core';

import QuillEditedContent from 'components/UI/QuillEditedContent';

export const getSubtextElement = (description: string) => {
  return (
    <QuillEditedContent fontWeight={400}>
      <div
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
    </QuillEditedContent>
  );
};

// Given a schema and field type, returns the options for a given array field
export const getOptions = (
  schema: JsonSchema,
  fieldType: 'singleEnum' | 'single' | 'multi',
  uiSchema?: ControlElement
) => {
  if (fieldType === 'multi') {
    return (
      (!Array.isArray(schema.items) &&
        schema.items?.oneOf?.map((option) => ({
          value: option.const as string,
          label: (option.title || option.const) as string,
          ...(option.image && { image: option.image }),
        }))) ||
      null
    );
  } else if (fieldType === 'singleEnum') {
    return (
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      schema?.enum
        ?.map((option, index) => ({
          value: option.toString(),
          label: uiSchema?.options?.enumNames[index] || option.toString(),
        }))
        .filter((e) => e.value && e.label) || null
    );
  } else {
    return (
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      schema?.oneOf
        ?.map((option) => ({
          value: option.const,
          label: option.title || option.const,
        }))
        .filter((e) => e.value && e.label) || null
    );
  }
};
