import React, { FormEvent } from 'react';

import {
  Toggle,
  IconTooltip,
  Box,
  Text,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { CLErrors } from 'typings';

import { PresentationMode } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../../../../messages';

interface ViewOption {
  value: PresentationMode;
  title: MessageDescriptor;
  description: MessageDescriptor;
  descriptionValues?: Record<string, React.ReactNode>;
  alwaysEnabled?: boolean;
}

interface Props {
  presentation_mode: PresentationMode | null | undefined;
  available_views: PresentationMode[] | null | undefined;
  apiErrors: CLErrors | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: PresentationMode) => void;
  handleAvailableViewsChange: (
    available_views: PresentationMode[],
    presentation_mode?: PresentationMode
  ) => void;
  title?: MessageDescriptor;
}

const DefaultViewPicker = ({
  presentation_mode,
  available_views,
  apiErrors,
  handleIdeasDisplayChange,
  handleAvailableViewsChange,
  title,
}: Props) => {
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams<{
    projectId: string;
    phaseId: string;
  }>();
  const ideaFeedEnabled = useFeatureFlag({ name: 'idea_feed' });

  const currentAvailableViews = available_views || ['card'];

  const inputFormUrl = `/admin/projects/${projectId}/phases/${phaseId}/form/edit`;
  const inputFormLink = (
    <a href={inputFormUrl} target="_blank" rel="noreferrer">
      <FormattedMessage {...messages.locationFieldWarningLink} />
    </a>
  );

  const viewOptions: ViewOption[] = [
    {
      value: 'card',
      title: messages.listViewTitle,
      description: messages.listViewDescription,
      alwaysEnabled: true,
    },
    {
      value: 'map',
      title: messages.mapViewTitle,
      description: messages.mapViewDescription,
      descriptionValues: { inputFormLink },
    },
    ...(ideaFeedEnabled
      ? [
          {
            value: 'feed' as const,
            title: messages.feedViewTitle,
            description: messages.feedViewDescription,
          },
        ]
      : []),
  ];

  const handleToggle = (view: PresentationMode) => (_event: FormEvent) => {
    const isEnabled = currentAvailableViews.includes(view);

    if (isEnabled) {
      const newViews = currentAvailableViews.filter((v) => v !== view);
      if (view === presentation_mode) {
        handleAvailableViewsChange(newViews, 'card');
      } else {
        handleAvailableViewsChange(newViews);
      }
    } else {
      handleAvailableViewsChange([...currentAvailableViews, view]);
    }
  };

  const handleMakeDefault = (view: PresentationMode) => () => {
    handleIdeasDisplayChange(view);
  };

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...(title || messages.availableViews)} />
      </SubSectionTitle>
      {viewOptions.map((option) => {
        const isEnabled = currentAvailableViews.includes(option.value);
        const isDefault = presentation_mode === option.value;

        return (
          <Box key={option.value} mb="16px">
            <Box display="flex" alignItems="flex-start" gap="12px">
              <Toggle
                checked={isEnabled}
                disabled={option.alwaysEnabled}
                onChange={handleToggle(option.value)}
              />
              <Box>
                <Box display="flex" alignItems="center" gap="4px">
                  <Text fontWeight="bold" fontSize="base" mb="0px" as="span">
                    {formatMessage(option.title)}
                  </Text>
                  {option.alwaysEnabled && (
                    <IconTooltip
                      content={formatMessage(messages.listViewCannotBeDisabled)}
                    />
                  )}
                </Box>
                <Text
                  color="textSecondary"
                  fontSize="s"
                  mb="4px"
                  as="span"
                  display="block"
                >
                  <FormattedMessage
                    {...option.description}
                    values={option.descriptionValues}
                  />
                </Text>
                {isEnabled && isDefault && (
                  <Text
                    color="primary"
                    fontSize="s"
                    fontWeight="bold"
                    mb="0px"
                    as="span"
                  >
                    {formatMessage(messages.defaultLabel)}
                  </Text>
                )}
                {isEnabled && !isDefault && (
                  <Text
                    color="teal400"
                    fontSize="s"
                    mb="0px"
                    as="span"
                    display="block"
                    textDecoration="underline"
                    style={{ cursor: 'pointer' }}
                    onClick={handleMakeDefault(option.value)}
                  >
                    {formatMessage(messages.makeDefault)}
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
      <Error apiErrors={apiErrors && apiErrors.presentation_mode} />
    </SectionField>
  );
};

export default DefaultViewPicker;
