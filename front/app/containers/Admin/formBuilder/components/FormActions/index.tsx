import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// components
import { Toggle, Box, Title } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import T from 'components/T';

// routing
import clHistory from 'utils/cl-router/history';

// i18n
import messages from '../messages';

import { Multiloc } from 'typings';

type FormActionsProps = {
  editFormLink: string;
  viewFormLink: string;
  postingEnabled: boolean;
  heading?: Multiloc;
  togglePostingEnabled: () => void;
} & InjectedIntlProps;

const FormActions = ({
  intl: { formatMessage },
  viewFormLink,
  editFormLink,
  heading,
  postingEnabled,
  togglePostingEnabled,
}: FormActionsProps) => {
  return (
    <Box width="100%" my="60px">
      <Box display="flex" flexDirection="row" width="100%" mb="48px">
        <Box width="100%">
          <Title variant="h4">
            <T value={heading} />
          </Title>
        </Box>
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Toggle
            checked={postingEnabled}
            label={formatMessage(messages.openForSubmissions)}
            onChange={() => {
              togglePostingEnabled();
            }}
          />
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        width="100%"
        justifyContent="space-between"
      >
        <Button
          icon="download"
          buttonStyle="primary"
          width="auto"
          minWidth="312px"
        >
          {formatMessage(messages.downloadSurveyResults, {
            count: 956, // TODO: Get this from the API
          })}
        </Button>
        <Button
          icon="edit"
          buttonStyle="primary"
          width="auto"
          minWidth="312px"
          onClick={() => {
            clHistory.push(editFormLink);
          }}
        >
          {formatMessage(messages.editSurveyContent)}
        </Button>
        <Button
          linkTo={viewFormLink}
          icon="eye"
          openLinkInNewTab
          buttonStyle="primary"
          width="auto"
          minWidth="312px"
        >
          {formatMessage(messages.viewSurveyText)}
        </Button>
      </Box>
    </Box>
  );
};

export default injectIntl(FormActions);
