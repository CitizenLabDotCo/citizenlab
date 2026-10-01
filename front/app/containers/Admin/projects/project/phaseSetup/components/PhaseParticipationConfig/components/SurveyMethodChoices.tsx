import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import ParticipationMethodChoice, {
  ChildText,
} from './ParticipationMethodChoice';

export const SURVEY_METHODS = ['native_survey', 'poll', 'survey'] as const;

export type SurveyMethod = (typeof SURVEY_METHODS)[number];

export const isSurveyMethod = (
  method: ParticipationMethod
): method is SurveyMethod =>
  SURVEY_METHODS.some((surveyMethod) => surveyMethod === method);

interface Props {
  selected: ParticipationMethod;
  showExternalSurvey: boolean;
  onSelect: (event: React.MouseEvent, method: SurveyMethod) => void;
  disabledReasons?: Partial<Record<SurveyMethod, string>>;
  cardWidth?: string;
}

const DESCRIPTION_STYLE = {
  overflowWrap: 'break-word',
  textAlign: 'left',
  lineHeight: '21px',
} as const;

const SurveyMethodChoices = ({
  selected,
  showExternalSurvey,
  onSelect,
  disabledReasons = {},
  cardWidth,
}: Props) => {
  const { formatMessage } = useIntl();
  const pollsEnabled = useFeatureFlag({ name: 'polls' });

  const handleClick = (method: SurveyMethod) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (disabledReasons[method] || selected === method) return;
    onSelect(event, method);
  };

  return (
    <>
      <ParticipationMethodChoice
        onClick={handleClick('native_survey')}
        title={formatMessage(messages.survey)}
        selected={selected === 'native_survey'}
        participation_method="native_survey"
        width={cardWidth}
        disabledReason={disabledReasons.native_survey}
      >
        <Box
          width="100%"
          color={
            selected === 'native_survey' ? colors.primary : colors.coolGrey500
          }
          style={DESCRIPTION_STYLE}
        >
          <ul>
            <li>
              <FormattedMessage {...messages.aiPoweredInsights} />
            </li>
            <li>
              <FormattedMessage {...messages.manyQuestionTypes} />
            </li>
            <li>
              <FormattedMessage {...messages.logic} />
            </li>
            <li>
              <FormattedMessage {...messages.linkWithReportBuilder} />
            </li>
          </ul>
        </Box>
      </ParticipationMethodChoice>

      {pollsEnabled && (
        <ParticipationMethodChoice
          onClick={handleClick('poll')}
          title={formatMessage(messages.quickPoll)}
          selected={selected === 'poll'}
          participation_method="poll"
          width={cardWidth}
          disabledReason={disabledReasons.poll}
        >
          <ChildText selected={selected === 'poll'}>
            {formatMessage(messages.quickPollDescription)}
          </ChildText>
        </ParticipationMethodChoice>
      )}

      {showExternalSurvey && (
        <ParticipationMethodChoice
          onClick={handleClick('survey')}
          title={formatMessage(messages.externalSurvey)}
          selected={selected === 'survey'}
          participation_method="survey"
          width={cardWidth}
          disabledReason={disabledReasons.survey}
        >
          <Box
            width="100%"
            color={selected === 'survey' ? colors.primary : colors.coolGrey500}
            style={DESCRIPTION_STYLE}
          >
            <FormattedMessage {...messages.embedSurvey} />
            <ul>
              <li>
                <FormattedMessage {...messages.lacksAIText} />
              </li>
              <li>
                <FormattedMessage {...messages.lacksReportingText} />
              </li>
            </ul>
          </Box>
        </ParticipationMethodChoice>
      )}
    </>
  );
};

export default SurveyMethodChoices;
