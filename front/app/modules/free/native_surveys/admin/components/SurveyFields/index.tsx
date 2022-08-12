import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import Button from 'components/UI/Button';
import { List, SortableRow } from 'components/admin/ResourceList';
import { Box, Badge, Text } from '@citizenlab/cl2-component-library';
import T from 'components/T';

import { IFlatCustomField } from 'modules/free/native_surveys/services/surveyCustomFields';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const StyledBadge = styled(Badge)`
  margin-left: 12px;
`;

interface SurveyFieldsProps {
  onEditField: (field: IFlatCustomField) => void;
  surveyCustomFields: IFlatCustomField[];
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  handleDropRow: (fieldId: string, toIndex: number) => void;
  selectedFieldId?: string;
}

const SurveyFields = ({
  onEditField,
  surveyCustomFields,
  handleDragRow,
  handleDropRow,
  selectedFieldId,
}: SurveyFieldsProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Box p="32px" height="100%" overflowY="auto">
        <List key={surveyCustomFields.length}>
          {surveyCustomFields.map((field, index) => {
            const border =
              selectedFieldId === field.id ? `1px solid #74B4FF` : 'none';
            return (
              <Box border={border} key={field.id}>
                <SortableRow
                  id={field.id}
                  index={index}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                >
                  <Box display="flex" className="expand">
                    <Box as="span" display="flex" alignItems="center">
                      <Text fontSize="base" my="0px" color="adminTextColor">
                        <T value={field.title_multiloc} />
                      </Text>
                    </Box>
                    <StyledBadge color={colors.adminSecondaryTextColor}>
                      <FormattedMessage {...messages.shortAnswer} />
                    </StyledBadge>
                  </Box>
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
              </Box>
            );
          })}
        </List>
      </Box>
    </DndProvider>
  );
};

export default SurveyFields;
