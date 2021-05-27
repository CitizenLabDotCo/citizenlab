import useAppConfiguration from 'hooks/useAppConfiguration';
import messages from './messages';
import React, { ReactElement } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';
import styled from 'styled-components';
import { IconTooltip, Toggle } from 'cl2-component-library';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const StyledToggle = styled(Toggle)`
  margin-right: 15px;
`;

const Setting = styled.div`
  margin-bottom: 20px;
`;

const LabelTitleContainer = styled.div`
  display: flex;
`;

const LabelTitle = styled.div`
  font-weight: bold;
`;

const ToggleLabel = styled.label`
  display: flex;
`;

const LabelDescription = styled.div``;
const LabelContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 0.25rem;
`;

interface Props {
  onSettingChange: (settingName: string, settingValue: any) => void;
}

const FlagInnapropriateContentSetting = ({
  onSettingChange,
  intl: { formatMessage },
}: Props & InjectedIntlProps): ReactElement | null => {
  const appConfiguration = useAppConfiguration();

  if (isNilOrError(appConfiguration)) {
    return null;
  }

  const moderationSettings =
    appConfiguration.data.attributes.settings.moderation;
  const flagInnaproperiateContentEnabled = !!moderationSettings?.flag_inappropriate_content;

  function handleToggle() {
    onSettingChange('moderation', {
      ...moderationSettings,
      flag_inappropriate_content: !flagInnaproperiateContentEnabled,
    });
  }

  return (
    <Setting>
      <ToggleLabel>
        <StyledToggle
          checked={flagInnaproperiateContentEnabled}
          onChange={handleToggle}
        />
        <LabelContent>
          <LabelTitleContainer>
            <LabelTitle>
              {formatMessage(messages.inappropriateContentDetectionSetting)}
            </LabelTitle>
            <StyledIconTooltip
              content={
                <FormattedMessage
                  {...messages.inappropriateContentDetectionTooltip}
                  values={{
                    linkToActivityPage: (
                      <Link to="/admin/activity">
                        {formatMessage(messages.linkToActivityPageText)}
                      </Link>
                    ),
                  }}
                />
              }
            />
          </LabelTitleContainer>
          <LabelDescription>
            {formatMessage(
              messages.inappropriateContentDetectionSettingDescription
            )}
          </LabelDescription>
        </LabelContent>
      </ToggleLabel>
    </Setting>
  );
};

export default injectIntl(FlagInnapropriateContentSetting);
