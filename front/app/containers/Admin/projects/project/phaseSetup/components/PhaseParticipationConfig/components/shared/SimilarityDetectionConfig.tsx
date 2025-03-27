import React from 'react';

import {
  IconTooltip,
  Toggle,
  Input,
  Box,
} from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

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
  const isAuthoringAssistanceEnabled = useFeatureFlag({
    name: 'authoring_assistance',
  });
  const { data: user } = useAuthUser();

  if (!isAuthoringAssistanceEnabled) {
    return null;
  }

  const allowConfiguringThreshold = isSuperAdmin(user);

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
        <Toggle
          label={<FormattedMessage {...messages.enableSimilarInputDetection} />}
          checked={!!similarity_enabled}
          onChange={() => handleSimilarityEnabledChange(!similarity_enabled)}
          id="similarity_enabled"
        />
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
                        {...messages.similarityThresholdTitleTooltip}
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
                        {...messages.similarityThresholdBodyTooltip}
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
