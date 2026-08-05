import React from 'react';

import {
  Box,
  ButtonStyles,
  Icon,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';
import { stripHtml } from 'utils/textUtils';

import messages from '../messages';

import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';
import { getExtraSurveyState } from './utils';

const DESCRIPTION_MAX_LENGTH = 160;

type Props = {
  phase: IPhaseData;
  buttonStyle: ButtonStyles;
  buttonTextMultiloc?: Multiloc;
};

const SurveyCard = ({ phase, buttonStyle, buttonTextMultiloc }: Props) => {
  const theme = useTheme();
  const localize = useLocalize();

  const state = getExtraSurveyState(phase);
  const description = stripHtml(
    localize(phase.attributes.description_multiloc),
    DESCRIPTION_MAX_LENGTH
  ).trim();

  return (
    <Box
      border={`1px solid ${colors.borderLight}`}
      borderRadius="8px"
      bgColor={colors.white}
      p="20px"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="12px"
      >
        <Box display="flex" alignItems="center" gap="6px">
          <Icon
            name="survey"
            width="18px"
            height="18px"
            fill={theme.colors.tenantPrimary}
          />
          <Text
            m="0px"
            fontSize="xs"
            fontWeight="bold"
            color="tenantPrimary"
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            <FormattedMessage {...messages.extraSurveysSurveyLabel} />
          </Text>
        </Box>
        <StatusBadge state={state} />
      </Box>
      <Title variant="h3" color="tenantText" m="0px" mb="8px">
        {localize(phase.attributes.title_multiloc)}
      </Title>
      {description && (
        <Text m="0px" mb="16px" color="textSecondary">
          {description}
        </Text>
      )}
      <ActionButton
        phase={phase}
        buttonStyle={buttonStyle}
        buttonTextMultiloc={buttonTextMultiloc}
      />
    </Box>
  );
};

export default SurveyCard;
