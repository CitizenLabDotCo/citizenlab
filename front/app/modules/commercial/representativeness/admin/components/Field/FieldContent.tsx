import React from 'react';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Title, Toggle, Text } from '@citizenlab/cl2-component-library';
import { SortableList, SortableRow } from 'components/admin/ResourceList';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

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

const FieldContent = ({
  fieldId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(fieldId);
  const localize = useLocalize();

  if (isNilOrError(userCustomFieldOptions)) return null;

  return (
    <>
      <Box
        background="#FCFCFC"
        width="100%"
        height="100%"
        border={`1px ${colors.separation} solid`}
        py="20px"
        px="16px"
        display="flex"
      >
        <Box width="50%">
          <Title variant="h6" as="h4" mt="0px">
            {formatMessage(messages.options).toUpperCase()}
          </Title>
          <SortableList items={userCustomFieldOptions} onReorder={console.log}>
            {({ itemsList, handleDragRow, handleDropRow }) => (
              <>
                {itemsList.map(
                  (
                    { id, attributes }: IUserCustomFieldOptionData,
                    index: number
                  ) => (
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
                        <StyledText
                          ml="12px"
                          variant="bodyM"
                          color="adminTextColor"
                        >
                          {localize(attributes.title_multiloc)}
                        </StyledText>
                      </Box>
                    </SortableRow>
                  )
                )}
              </>
            )}
          </SortableList>
        </Box>
        <Box width="50%">
          <Title variant="h6" as="h4" mt="0px">
            {formatMessage(messages.numberOfTotalResidents).toUpperCase()}
          </Title>
        </Box>
      </Box>
    </>
  );
};

export default injectIntl(FieldContent);
