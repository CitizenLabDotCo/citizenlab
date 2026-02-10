import React from 'react';

import { Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';
import { CLErrors } from 'typings';

import { PresentationMode } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from '../../../../../messages';

interface Props {
  presentation_mode: PresentationMode | null | undefined;
  apiErrors: CLErrors | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: PresentationMode) => void;
  title?: MessageDescriptor;
}

export default ({
  presentation_mode,
  apiErrors,
  handleIdeasDisplayChange,
  title,
}: Props) => {
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };
  const ideaFeedEnabled = useFeatureFlag({ name: 'idea_feed' });

  const inputFormUrl = `/admin/projects/${projectId}/phases/${phaseId}/form/edit`;

  const inputFormLink = (
    <a href={inputFormUrl} target="_blank" rel="noreferrer">
      <FormattedMessage {...messages.locationFieldWarningLink} />
    </a>
  );

  const displayOptions: {
    value: PresentationMode;
    label: MessageDescriptor;
  }[] = [
    { value: 'card', label: messages.cardDisplay },
    { value: 'map', label: messages.mapDisplay },
    ...(ideaFeedEnabled
      ? [{ value: 'feed' as const, label: messages.feedDisplay }]
      : []),
  ];

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...(title || messages.inputsDefaultView)} />
        <IconTooltip
          content={<FormattedMessage {...messages.inputsDefaultViewTooltip} />}
        />
      </SubSectionTitle>
      {displayOptions.map((option) => (
        <Radio
          key={option.value}
          onChange={handleIdeasDisplayChange}
          currentValue={presentation_mode}
          value={option.value}
          name="presentation_mode"
          id={`presentation_mode-${option.value}`}
          label={<FormattedMessage {...option.label} />}
        />
      ))}
      <Error apiErrors={apiErrors && apiErrors.presentation_mode} />
      {projectId && phaseId && presentation_mode !== 'feed' && (
        <Warning>
          <FormattedMessage
            {...messages.locationFieldWarning}
            values={{ inputFormLink }}
          />
        </Warning>
      )}
    </SectionField>
  );
};
