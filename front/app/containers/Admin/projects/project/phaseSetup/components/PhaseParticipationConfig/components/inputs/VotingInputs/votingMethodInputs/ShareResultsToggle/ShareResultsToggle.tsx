import React from 'react';

import {
  Toggle,
  Text,
  Box,
  colors,
  Image,
} from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import VoteSharingDisabledSvg from './SvgPreviews/vote_sharing_disabled.svg';
import VoteSharingEnabledSvg from './SvgPreviews/vote_sharing_enabled.svg';

type Props = {
  toggleAutoshareResultsEnabled: () => void;
  autoshare_results_enabled: boolean | null | undefined;
  apiErrors: CLErrors | null | undefined;
};
const ShareResultsToggle = ({
  toggleAutoshareResultsEnabled,
  autoshare_results_enabled,
  apiErrors,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SectionField>
      <SubSectionTitleWithDescription>
        <FormattedMessage {...messages.resultSharing} />
      </SubSectionTitleWithDescription>
      <Box mt="12px" mb="4px" width="1000px">
        <Toggle
          checked={!!autoshare_results_enabled}
          onChange={toggleAutoshareResultsEnabled}
          label={
            <Box display="flex" gap="12px">
              <Box>
                <Text fontWeight="bold" color="blue500" m="0px">
                  {formatMessage(messages.autoshareResults)}
                </Text>
                <Text m="0px">
                  {formatMessage(messages.autoshareResultsToggleDescription)}
                </Text>
              </Box>
              {autoshare_results_enabled ? (
                <Image src={VoteSharingEnabledSvg} alt={''} />
              ) : (
                <Image src={VoteSharingDisabledSvg} alt={''} />
              )}
            </Box>
          }
        />
      </Box>

      <FormattedMessage
        {...messages.autoshareResultSupportArticleLink}
        values={{
          link: (
            <a
              href={formatMessage(
                messages.autoshareResultSupportArticleLinkUrl3
              )}
              style={{ color: colors.teal500 }}
            >
              {formatMessage(messages.autoshareResultSupportArticleLinkText)}
            </a>
          ),
        }}
      />
      <Error apiErrors={apiErrors && apiErrors.autoshare_results_enabled} />
    </SectionField>
  );
};

export default ShareResultsToggle;
