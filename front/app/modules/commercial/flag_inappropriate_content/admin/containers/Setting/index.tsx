import React, { ReactElement } from 'react';

import { IconTooltip, Toggle } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { trackEventByName } from 'utils/analytics';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import tracks from '../../../tracks';

import messages from './messages';

const StyledToggle = styled(Toggle)`
  margin-right: 15px;
`;

const Container = styled.div`
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
  className?: string;
}

const FlagInnapropriateContentSetting = ({
  className,
  onSettingChange,
  intl: { formatMessage },
}: Props & WrappedComponentProps): ReactElement | null => {
  const { data: appConfiguration } = useAppConfiguration();
  const flagInnaproperiateContentSetting =
    !isNilOrError(appConfiguration) &&
    appConfiguration.data.attributes.settings.flag_inappropriate_content
      ? appConfiguration.data.attributes.settings.flag_inappropriate_content
      : undefined;

  if (flagInnaproperiateContentSetting) {
    const flagInnaproperiateContentEnabled =
      flagInnaproperiateContentSetting.enabled;

    const handleToggle = () => {
      onSettingChange('flag_inappropriate_content', {
        ...flagInnaproperiateContentSetting,
        flag_inappropriate_content: !flagInnaproperiateContentEnabled,
      });

      trackEventByName(tracks.settingToggled, {
        settingChangedTo: !flagInnaproperiateContentEnabled,
      });
    };

    return (
      <Container className={className || ''}>
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
                    {...messages.inappropriateContentDetectionToggleTooltip}
                    values={{
                      linkToActivityPage: (
                        <Link to="/admin/dashboard/moderation">
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
      </Container>
    );
  }

  return null;
};

export default injectIntl(FlagInnapropriateContentSetting);
