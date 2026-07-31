import React from 'react';

import { ButtonStyles } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IPhaseData } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { getLocalisedDateString, timeAgo } from 'utils/dateUtils';

import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

import { getExtraSurveyState } from './utils';

type Props = {
  phase: IPhaseData;
  buttonStyle: ButtonStyles;
  buttonTextMultiloc?: Multiloc;
};

const ActionButton = ({ phase, buttonStyle, buttonTextMultiloc }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const projectId = useWidgetProjectId();
  const { data: project } = useProjectById(projectId);

  const state = getExtraSurveyState(phase);
  const { start_at, end_at, native_survey_button_multiloc } = phase.attributes;

  if (state === 'open') {
    const slug = project?.data.attributes.slug;
    const buttonText =
      localize(buttonTextMultiloc) ||
      localize(native_survey_button_multiloc) ||
      formatMessage(messages.extraSurveysDefaultButtonText);

    if (!slug) return null;

    return (
      <ButtonWithLink
        className="e2e-extra-survey-button"
        to="/projects/$slug/surveys/new"
        params={{ slug }}
        search={{ phase_id: phase.id }}
        buttonStyle={buttonStyle}
        width="100%"
      >
        {buttonText}
      </ButtonWithLink>
    );
  }

  const disabledContent = {
    upcoming: formatMessage(messages.extraSurveysOpensOn, {
      date: getLocalisedDateString(start_at) || start_at,
    }),
    closed:
      end_at && new Date(end_at) < new Date()
        ? formatMessage(messages.extraSurveysClosedTimeAgo, {
            timeAgo: timeAgo(new Date(end_at).getTime(), locale) || '',
          })
        : formatMessage(messages.extraSurveysClosed),
    taken: formatMessage(messages.extraSurveysResponseReceived),
    notEligible: formatMessage(messages.extraSurveysNotEligible),
  }[state];

  return (
    <ButtonWithLink
      className="e2e-extra-survey-button"
      buttonStyle={buttonStyle}
      width="100%"
      disabled
      icon={
        state === 'taken'
          ? 'check'
          : state === 'notEligible'
          ? 'lock'
          : undefined
      }
    >
      {disabledContent}
    </ButtonWithLink>
  );
};

export default ActionButton;
