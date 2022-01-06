import React from 'react';
import styled from 'styled-components';
import { colors, IconTooltip } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// services
import { getFlagType } from '../../utils';

// hooks
import useInappropriateContentFlag from '../../hooks/useInappropriateContentFlag';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const WarningContent = styled.div`
  color: ${colors.clRedError};
  font-weight: bold;
  margin-right: 5px;
`;

const StyledIconTooltip = styled(IconTooltip)``;

interface Props {
  inappropriateContentFlagId: string;
}

const InappropriateContentWarning = ({
  inappropriateContentFlagId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const inappropriateContentFlag = useInappropriateContentFlag(
    inappropriateContentFlagId
  );

  if (!isNilOrError(inappropriateContentFlag)) {
    const flagType = getFlagType(inappropriateContentFlag);
    const reasonCode = inappropriateContentFlag.attributes.reason_code;

    // if reasonCode is null, it means the flag has been removed
    // and we shouldn't display anything
    if (reasonCode && flagType) {
      return (
        <Container>
          <WarningContent>
            {
              {
                nlp_flagged: formatMessage(messages.nlpFlaggedWarningText),
                user_flagged: formatMessage(messages.userFlaggedWarningText),
              }[flagType]
            }
          </WarningContent>
          <StyledIconTooltip
            iconColor={colors.clRedError}
            content={formatMessage(messages.flagTooltip)}
          />
        </Container>
      );
    }
  }

  return null;
};

export default injectIntl(InappropriateContentWarning);
