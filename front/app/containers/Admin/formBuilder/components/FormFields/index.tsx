import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { useFormContext } from 'react-hook-form';

// intl
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { List } from 'components/admin/ResourceList';
import { Box, colors } from '@citizenlab/cl2-component-library';
import { PageRow } from '../SortableRow/PageRow';
import { FieldElement } from './FieldElement';

// hooks and services
import useLocale from 'hooks/useLocale';
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

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

type PageStructure = {
  questions: IFlatCustomField[];
  page: IFlatCustomField;
};

interface FormFieldsProps {
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  dropField?: (
    initialFieldIndex: number,
    finalFieldIndex: number,
    initialPageIndex?: number,
    finalPageIndex?: number
  ) => void;
  dropPage?: (initialIndex: number, finalIndex: number) => void;
  isEditingDisabled: boolean;
  selectedFieldId?: string;
}

const FormFields = ({
  onEditField,
  dropField,
  dropPage,
  selectedFieldId,
  isEditingDisabled,
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
      });
    } else {
      const lastPage = nestedPageData[nestedPageData.length - 1];
      lastPage.questions.push({
        ...field,
      });
    }
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Box py="32px" height="100%" overflowY="auto" overflowX="hidden">
        <List key={nestedPageData.length}>
          {nestedPageData.map((pageGrouping, index) => {
            const pageId = pageGrouping.page.id;

            return (
              <PageRow
                id={pageGrouping.page.id}
                pageIndex={index}
                dropRow={dropPage}
                py="0px"
              >
                <FieldElement
                  key={pageId}
                  field={pageGrouping.page}
                  pageIndex={index}
                  isEditingDisabled={isEditingDisabled}
                  getTranslatedFieldType={getTranslatedFieldType}
                  selectedFieldId={selectedFieldId}
                  onEditField={onEditField}
                />
                {pageGrouping.questions.map((question) => {
                  return (
                    <FieldElement
                      key={question.id}
                      dropRow={dropField}
                      pageIndex={index}
                      field={question}
                      isEditingDisabled={isEditingDisabled}
                      getTranslatedFieldType={getTranslatedFieldType}
                      selectedFieldId={selectedFieldId}
                      onEditField={onEditField}
                    />
                  );
                })}
              </PageRow>
            );
          })}
        </List>
        {formCustomFields.length > 0 && (
          <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
        )}
      </Box>
    </DndProvider>
  );
};

export default FormFields;
