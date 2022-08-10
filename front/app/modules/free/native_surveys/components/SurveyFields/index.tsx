import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Button from 'components/UI/Button';
import { List, SortableRow, TextCell } from 'components/admin/ResourceList';
import { Box } from '@citizenlab/cl2-component-library';
import T from 'components/T';

// typings
import { ISurveyCustomFieldData } from 'modules/free/native_surveys/services/surveyCustomFields';

import styled from 'styled-components';

const StyledTextCell = styled(TextCell)`
  display: flex;
`;

const TextCellContent = styled.span`
  display: flex;
  align-items: center;
`;

interface CustomFieldsProps {
  onEditField: (field: ISurveyCustomFieldData) => void;
  surveyCustomFields: ISurveyCustomFieldData[];
}

const SurveyFields = ({
  onEditField,
  surveyCustomFields,
}: CustomFieldsProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Box p="32px" height="100%" overflowY="auto">
        <List key={surveyCustomFields.length}>
          {surveyCustomFields.map((field, index) => {
            return (
              <SortableRow
                key={field.id}
                id={field.id}
                className="e2e-custom-registration-field-row"
                index={index}
                moveRow={() => {
                  // TODO: implement moveRow
                }}
                dropRow={() => {
                  // TODO: implement dropRow
                }}
              >
                <StyledTextCell className="expand">
                  <TextCellContent>
                    <T value={field.attributes.title_multiloc} />
                  </TextCellContent>
                </StyledTextCell>
                <Button
                  buttonStyle="secondary"
                  icon="edit"
                  onClick={() => {
                    onEditField(field);
                  }}
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </Button>
              </SortableRow>
            );
          })}
        </List>
      </Box>
    </DndProvider>
  );
};

export default SurveyFields;
