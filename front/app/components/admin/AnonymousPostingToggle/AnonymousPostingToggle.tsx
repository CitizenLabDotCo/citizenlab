import {
  Toggle,
  Text,
  Box,
  IconTooltip,
  StatusLabel,
  colors,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import useFeatureFlag from 'hooks/useFeatureFlag';

interface AnonymousPostingToggleProps {
  allow_anonymous_participation: boolean | null | undefined;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  toggleLabel?: JSX.Element;
}

const AnonymousPostingToggle = ({
  allow_anonymous_participation,
  handleAllowAnonymousParticipationOnChange,
  toggleLabel,
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
                      messages.userAnonymitySupportTooltipLinkUrl
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
        <StatusLabel
          text={formatMessage(messages.betaLabel)}
          backgroundColor={colors.background}
          variant="outlined"
        />
      </SubSectionTitle>
      <Toggle
        checked={allow_anonymous_participation || false}
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
    </SectionField>
  );
};

export default AnonymousPostingToggle;
