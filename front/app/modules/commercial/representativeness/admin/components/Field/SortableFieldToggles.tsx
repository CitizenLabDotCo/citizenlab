import React from 'react';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Toggle, Text } from '@citizenlab/cl2-component-library';
import { SortableList, SortableRow } from 'components/admin/ResourceList';

// stylings
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';

const StyledText = styled(Text)`
  font-weight: 500;
`;

interface Props {
  fieldId: string;
}

const SortableFieldToggles = ({ fieldId }: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(fieldId);
  const localize = useLocalize();

  if (isNilOrError(userCustomFieldOptions)) return null;

  return (
    <SortableList items={userCustomFieldOptions} onReorder={console.log}>
      {({ itemsList, handleDragRow, handleDropRow }) => (
        <>
          {itemsList.map(
            ({ id, attributes }: IUserCustomFieldOptionData, index: number) => (
              <SortableRow
                key={id}
                id={id}
                index={index}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
                noStyling
              >
                <Box ml="8px" display="flex" alignItems="center">
                  <Toggle checked={true} onChange={console.log} />
                  <StyledText ml="12px" variant="bodyM" color="adminTextColor">
                    {localize(attributes.title_multiloc)}
                  </StyledText>
                </Box>
              </SortableRow>
            )
          )}
        </>
      )}
    </SortableList>
  );
};

export default SortableFieldToggles;
