import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { useFormContext } from 'react-hook-form';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import Button from 'components/UI/Button';
import { List, SortableRow } from 'components/admin/ResourceList';
import { Box, Badge, Text } from '@citizenlab/cl2-component-library';
import T from 'components/T';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

const StyledBadge = styled(Badge)`
  margin-left: 12px;
`;

interface FormFieldsProps {
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  selectedFieldId?: string;
}

const FormFields = ({
  onEditField,
  handleDragRow,
  selectedFieldId,
}: FormFieldsProps) => {
  const { watch } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  return (
    <DndProvider backend={HTML5Backend}>
      <Box p="32px" height="100%" overflowY="auto">
        <List key={formCustomFields.length}>
          {formCustomFields.map((field, index) => {
            const border =
              selectedFieldId === field.id
                ? `1px solid ${colors.clBlueLight}`
                : 'none';
            return (
              <Box border={border} key={field.id}>
                <SortableRow
                  id={field.id}
                  index={index}
                  moveRow={handleDragRow}
                  dropRow={() => {
                    // Do nothing, no need to handle dropping a row for now
                  }}
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
                      onEditField({ ...field, index });
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

export default FormFields;
