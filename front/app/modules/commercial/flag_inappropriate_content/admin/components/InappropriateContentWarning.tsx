import React from 'react';
import styled from 'styled-components';
import { colors, IconTooltip } from '@citizenlab/cl2-component-library';

// services
import { getFlagType } from '../../utils';

// hooks
import useInappropriateContentFlag from '../../api/inappropriate_content_flags/useInappropriateContentFlag';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const WarningContent = styled.div`
  color: ${colors.red600};
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
}: Props & WrappedComponentProps) => {
  const { data: inappropriateContentFlag } = useInappropriateContentFlag(
    inappropriateContentFlagId
  );

  if (inappropriateContentFlag) {
    const flagType = getFlagType(inappropriateContentFlag.data);
    const reasonCode = inappropriateContentFlag.data.attributes.reason_code;

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
            iconColor={colors.red600}
            content={formatMessage(messages.flagTooltip)}
          />
        </Container>
      );
    }
  }

  return null;
};

export default injectIntl(InappropriateContentWarning);
