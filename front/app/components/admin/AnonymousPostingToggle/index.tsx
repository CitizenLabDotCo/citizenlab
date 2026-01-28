import React from 'react';

import {
  Toggle,
  Text,
  Box,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface AnonymousPostingToggleProps {
  allow_anonymous_participation: boolean | null | undefined;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  toggleLabel?: JSX.Element;
  disabledReason?: string;
}

const AnonymousPostingToggle = ({
  allow_anonymous_participation,
  handleAllowAnonymousParticipationOnChange,
  toggleLabel,
  disabledReason,
}: AnonymousPostingToggleProps) => {
  const { formatMessage } = useIntl();
  const hasAnonymousParticipationEnabled = useFeatureFlag({
    name: 'anonymous_participation',
  });

  if (!hasAnonymousParticipationEnabled) return null;

  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.userAnonymity} />
        <IconTooltip
          p="0px"
          ml="0px"
          placement="top-start"
          content={
            <FormattedMessage
              {...messages.userAnonymitySupportTooltip}
              values={{
                supportArticle: (
                  <a
                    href={formatMessage(
                      messages.userAnonymitySupportTooltipLinkUrl2
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      {...messages.userAnonymitySupportTooltipLinkText}
                    />
                  </a>
                ),
              }}
            />
          }
        />
      </SubSectionTitle>
      <Toggle
        checked={allow_anonymous_participation || false}
        disabled={!!disabledReason}
        onChange={() => {
          handleAllowAnonymousParticipationOnChange(
            !allow_anonymous_participation
          );
        }}
        label={
          toggleLabel ? (
            toggleLabel
          ) : (
            <Box ml="8px" id="e2e-anonymous-posting-toggle">
              <Box display="flex">
                <Text
                  color="primary"
                  mb="0px"
                  fontSize="m"
                  style={{ fontWeight: 600 }}
                >
                  <FormattedMessage {...messages.userAnonymityLabelText} />
                </Text>
                <Box ml="4px" mt="16px">
                  <IconTooltip
                    placement="top-start"
                    content={formatMessage(messages.userAnonymityLabelTooltip)}
                  />
                </Box>
              </Box>

              <Text color="coolGrey600" mt="0px" fontSize="m">
                <FormattedMessage {...messages.userAnonymityLabelSubtext} />
              </Text>
            </Box>
          )
        }
      />
      {disabledReason && (
        <Box mt="8px">
          <Warning>{disabledReason}</Warning>
        </Box>
      )}
    </SectionField>
  );
};

export default AnonymousPostingToggle;
