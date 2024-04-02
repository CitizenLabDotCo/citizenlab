import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
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
      showCountDown={false}
      showProgressBar={false}
      showVoteButtons={false}
      showReadAnswerButton
    />
  );
};

export default Ineligible;
