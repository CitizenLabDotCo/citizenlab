import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import { FieldElement } from './FieldElement';

// hooks and services
import useLocale from 'hooks/useLocale';
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

import { DragAndDrop, Drag, Drop } from '../DragAndDrop';
import { PageStructure } from '../../containers/projects/forms/edit/utils';

// Assign field badge text
const getTranslatedFieldType = (field) => {
  switch (field) {
    case 'text':
      return messages.shortAnswer;
    case 'multiselect':
    case 'select':
      return messages.multipleChoice;
    case 'page':
      return messages.page;
    case 'number':
      return messages.number;
    case 'linear_scale':
      return messages.linearScale;
    default:
      return messages.default;
  }
};

interface FormFieldsProps {
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  handleDragEnd: (result: any, nestedPageData: any) => void;
  isEditingDisabled: boolean;
  selectedFieldId?: string;
}

const FormFields = ({
  onEditField,
  selectedFieldId,
  isEditingDisabled,
  handleDragEnd,
}: FormFieldsProps) => {
  const { watch } = useFormContext();
  const locale = useLocale();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  if (isNilOrError(locale)) {
    return null;
  }

  const nestedPageData: PageStructure[] = [];
  formCustomFields.forEach((field) => {
    if (field.input_type === 'page') {
      nestedPageData.push({
        page: field,
        questions: [],
        id: field.id,
      });
    } else {
      const lastPage = nestedPageData[nestedPageData.length - 1];
      lastPage.questions.push({
        ...field,
      });
    }
  });

  return (
    <Box py="32px" height="100%">
      <DragAndDrop
        onDragEnd={(result) => {
          handleDragEnd(result, nestedPageData);
        }}
      >
        <Drop id="droppable" type="droppable-page">
          {nestedPageData.map((pageGrouping, pageIndex) => {
            return (
              <Drag
                key={pageGrouping.id}
                id={pageGrouping.id}
                index={pageIndex}
              >
                <FieldElement
                  field={pageGrouping.page}
                  isEditingDisabled={isEditingDisabled}
                  getTranslatedFieldType={getTranslatedFieldType}
                  selectedFieldId={selectedFieldId}
                  onEditField={onEditField}
                />

                <Drop
                  key={pageGrouping.id}
                  id={pageGrouping.id}
                  type="droppable-question"
                >
                  {pageGrouping.questions.length === 0 ? (
                    <Box height="4px" />
                  ) : (
                    <>
                      {pageGrouping.questions.map((question, index) => {
                        return (
                          <Drag
                            key={question.id}
                            id={question.id}
                            index={index}
                          >
                            <FieldElement
                              key={question.id}
                              field={question}
                              isEditingDisabled={isEditingDisabled}
                              getTranslatedFieldType={getTranslatedFieldType}
                              selectedFieldId={selectedFieldId}
                              onEditField={onEditField}
                            />
                          </Drag>
                        );
                      })}
                    </>
                  )}
                </Drop>
              </Drag>
            );
          })}
        </Drop>
      </DragAndDrop>
      {formCustomFields.length > 0 && (
        <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
      )}
    </Box>
  );
};

export default FormFields;
