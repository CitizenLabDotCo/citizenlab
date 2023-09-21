import React from 'react';

// components
import {
  Box,
  IconTooltip,
  Text,
  Badge,
  Icon,
} from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

// utils
import { getTranslatedFieldBadgeLabel } from '../../utils';
import { getFieldIcon } from './utils';
import { builtInFieldKeys } from 'components/FormBuilder/utils';

// typings
import { IFlatCustomField } from 'services/formCustomFields';

interface Props {
  field: IFlatCustomField;
  displayBuiltInFields: boolean;
}

const IconsAndBadges = ({ field, displayBuiltInFields }: Props) => {
  const { formatMessage } = useIntl();

  const showVisibilityIcon =
    displayBuiltInFields &&
    field.input_type !== 'section' &&
    !builtInFieldKeys.includes(field.key);

  const isFieldGrouping = ['page', 'section'].includes(field.input_type);

  return (
    <Box pr="32px" display="flex" height="100%" alignContent="center">
      {showVisibilityIcon && (
        <IconTooltip
          placement="top"
          icon="eye-off"
          iconColor={colors.coolGrey300}
          content={formatMessage(messages.fieldIsNotVisibleTooltip)}
          maxTooltipWidth={250}
        />
      )}
      {field.required && (
        <Box mt="auto" mb="auto" ml="12px">
          {' '}
          <Badge className="inverse" color={colors.green100}>
            <Text
              color="green500"
              py="0px"
              my="0px"
              fontSize="xs"
              fontWeight="bold"
            >
              <FormattedMessage {...messages.required} />
            </Text>
          </Badge>
        </Box>
      )}
      {!isFieldGrouping && (
        <Box my="auto" ml="12px">
          {' '}
          <Badge className="inverse" color={colors.grey200}>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              flexWrap="nowrap"
            >
              <Icon
                fill={colors.coolGrey600}
                width="16px"
                height="16px"
                name={getFieldIcon(field.input_type, field.key)}
              />
              <Text
                color="coolGrey600"
                py="0px"
                my="0px"
                fontSize="xs"
                fontWeight="bold"
                ml="4px"
                whiteSpace="nowrap"
              >
                <FormattedMessage {...getTranslatedFieldBadgeLabel(field)} />
              </Text>
            </Box>
          </Badge>
        </Box>
      )}
    </Box>
  );
};

export default IconsAndBadges;
