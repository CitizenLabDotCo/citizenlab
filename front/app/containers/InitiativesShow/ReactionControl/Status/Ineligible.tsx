import React from 'react';
import { useTheme } from 'styled-components';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '../StatusWrapper';
import Status from '.';

const Ineligible = (props: StatusComponentProps) => {
  const theme = useTheme();

  return (
    <Status
      {...props}
      iconName="halt"
      statusExplanation={
        <FormattedMessage
          {...messages.ineligibleStatusExplanation}
          values={{
            ineligibleStatusExplanationBold: (
              <b>
                <FormattedMessage
                  {...messages.ineligibleStatusExplanationBold}
                />
              </b>
            ),
          }}
        >
          {(text) => (
            <>
              {text}
              <IconTooltip
                icon="info-outline"
                iconColor={theme.colors.tenantText}
                theme="light"
                placement="bottom"
                content={
                  <T
                    value={props.initiativeSettings.eligibility_criteria}
                    supportHtml
                  />
                }
              />
            </>
          )}
        </FormattedMessage>
      }
      barColor="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
      showCountDown={false}
      showProgressBar={false}
      showVoteButtons={false}
      showReadAnswerButton
    />
  );
};

export default Ineligible;
