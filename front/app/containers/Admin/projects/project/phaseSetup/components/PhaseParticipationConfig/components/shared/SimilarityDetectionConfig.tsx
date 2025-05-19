import React from 'react';

import {
  IconTooltip,
  Toggle,
  Input,
  Box,
} from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import EarlyAccessBadge from 'components/admin/EarlyAccessBadge';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage } from 'utils/cl-intl';
import { isSuperAdmin } from 'utils/permissions/roles';

import messages from '../messages';

interface Props {
  similarity_enabled?: boolean | null;
  similarity_threshold_title: number | null | undefined;
  similarity_threshold_body: number | null | undefined;
  apiErrors: CLErrors | null | undefined;
  handleSimilarityEnabledChange: (value: boolean) => void;
  handleThresholdChange: (
    field: 'similarity_threshold_title' | 'similarity_threshold_body',
    value: number
  ) => void;
}

const SimilarityDetectionConfig = ({
  similarity_enabled,
  similarity_threshold_title,
  similarity_threshold_body,
  apiErrors,
  handleSimilarityEnabledChange,
  handleThresholdChange,
}: Props) => {
  const isInputIQActivated = useFeatureFlag({ name: 'input_iq' });
  const isInputIQAllowed = useFeatureFlag({
    name: 'input_iq',
    onlyCheckAllowed: true,
  });
  const { data: user } = useAuthUser();

  const { data: appConfiguration } = useAppConfiguration();
  const tenantTimezone =
    appConfiguration?.data.attributes.settings.core.timezone;
  if (!tenantTimezone) return null;

  const showEarlyAccessMessage = isInputIQActivated;
  const showUpsellTooltip = !isInputIQAllowed;
  const allowConfiguringThreshold = isSuperAdmin(user) && isInputIQActivated;

  return (
    <SectionField display="flex">
      <SubSectionTitle>
        <FormattedMessage {...messages.similarInputDetectionTitle} />
        <IconTooltip
          content={
            <FormattedMessage {...messages.similarInputDetectionTooltip} />
          }
        />
      </SubSectionTitle>

      <Box display="flex" flexDirection="column" gap="16px" width="100%">
        <UpsellTooltip disabled={!showUpsellTooltip}>
          <Toggle
            label={
              <>
                <FormattedMessage {...messages.enableSimilarInputDetection} />
                {showEarlyAccessMessage && <EarlyAccessBadge />}
              </>
            }
            checked={!!similarity_enabled && isInputIQActivated}
            onChange={() => handleSimilarityEnabledChange(!similarity_enabled)}
            id="similarity_enabled"
            disabled={!isInputIQActivated}
          />
        </UpsellTooltip>
        <Error apiErrors={apiErrors?.similarity_enabled} />

        {allowConfiguringThreshold && similarity_enabled && (
          <>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={similarity_threshold_title?.toString() ?? ''}
              onChange={(value) =>
                handleThresholdChange(
                  'similarity_threshold_title',
                  parseFloat(value)
                )
              }
              name="similarity_threshold_title"
              label={
                <Box display="flex" alignItems="center">
                  <FormattedMessage {...messages.similarityThresholdTitle} />{' '}
                  <IconTooltip
                    content={
                      <FormattedMessage
                        {...messages.similarityThresholdTitleTooltipMessage}
                      />
                    }
                  />
                </Box>
              }
            />
            <Error apiErrors={apiErrors?.similarity_threshold_title} />

            <Input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={similarity_threshold_body?.toString() ?? ''}
              onChange={(value) =>
                handleThresholdChange(
                  'similarity_threshold_body',
                  parseFloat(value)
                )
              }
              name="similarity_threshold_body"
              label={
                <Box display="flex" alignItems="center">
                  <FormattedMessage {...messages.similarityThresholdBody} />{' '}
                  <IconTooltip
                    content={
                      <FormattedMessage
                        {...messages.similarityThresholdBodyTooltipMessage}
                      />
                    }
                  />
                </Box>
              }
            />
            <Error apiErrors={apiErrors?.similarity_threshold_body} />
          </>
        )}
      </Box>
    </SectionField>
  );
};

export default SimilarityDetectionConfig;
