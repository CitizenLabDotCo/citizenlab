import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Button from 'components/UI/Button';
import { List, SortableRow, TextCell } from 'components/admin/ResourceList';
import { Box, Badge } from '@citizenlab/cl2-component-library';
import T from 'components/T';

import { IFlatCustomField } from 'modules/free/native_surveys/services/surveyCustomFields';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const StyledTextCell = styled(TextCell)`
  display: flex;
`;

const TextCellContent = styled.span`
  display: flex;
  align-items: center;
`;

const StyledBadge = styled(Badge)`
  margin-left: 12px;
`;

interface CustomFieldsProps {
  onEditField: (field: IFlatCustomField) => void;
  surveyCustomFields: IFlatCustomField[];
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
                    <T value={field.title_multiloc} />
                  </TextCellContent>
                  <StyledBadge color={colors.adminSecondaryTextColor}>
                    <FormattedMessage {...messages.shortAnswer} />
                  </StyledBadge>
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
