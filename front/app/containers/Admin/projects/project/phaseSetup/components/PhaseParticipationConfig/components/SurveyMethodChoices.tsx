import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import ParticipationMethodChoice, {
  ChildText,
} from './ParticipationMethodChoice';

const LeftAlignedList = styled.ul`
  text-align: left;
`;

const DescriptionWrapper = styled.div<{ selected: boolean }>`
  width: 100%;
  color: ${({ selected }) => (selected ? colors.primary : colors.coolGrey500)};

  overflow-wrap: break-word;
  word-wrap: break-word;
  text-align: left;
  line-height: 21px;
`;

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
  /** Methods that can't be picked, with the reason shown on hover. */
  disabledReasons?: Partial<Record<SurveyMethod, string>>;
  cardWidth?: string;
}

// The three kinds of survey. Rendered as siblings, so the caller lays them out.
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
        <DescriptionWrapper selected={selected === 'native_survey'}>
          <LeftAlignedList>
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
          </LeftAlignedList>
        </DescriptionWrapper>
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
          <DescriptionWrapper selected={selected === 'survey'}>
            <FormattedMessage {...messages.embedSurvey} />
            <LeftAlignedList>
              <li>
                <FormattedMessage {...messages.lacksAIText} />
              </li>
              <li>
                <FormattedMessage {...messages.lacksReportingText} />
              </li>
            </LeftAlignedList>
          </DescriptionWrapper>
        </ParticipationMethodChoice>
      )}
    </>
  );
};

export default SurveyMethodChoices;
