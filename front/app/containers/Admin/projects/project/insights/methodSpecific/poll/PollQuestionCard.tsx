import React from 'react';

import BarRow from 'design-system/BarRow';
import DashboardCard from 'design-system/DashboardCard';

import usePollOptions from 'api/poll_options/usePollOptions';
import { IPollQuestionData } from 'api/poll_questions/types';

import useLocalize from 'hooks/useLocalize';

import pollMessages from 'containers/Admin/projects/project/poll/messages';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../shared/messages';

import messages from './messages';

interface Props {
  question: IPollQuestionData;
  // How many people picked each option, by option id.
  counts: Record<string, number>;
  respondents: number;
}

const PollQuestionCard = ({ question, counts, respondents }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: options } = usePollOptions(question.id);
  const { question_type, title_multiloc } = question.attributes;

  const sortedOptions = [...(options?.data ?? [])].sort(
    (a, b) => a.attributes.ordering - b.attributes.ordering
  );

  return (
    <DashboardCard
      title={localize(title_multiloc)}
      description={formatMessage(messages.questionDescription, {
        responses: respondents,
        questionType: formatMessage(
          question_type === 'single_option'
            ? pollMessages.singleOption
            : pollMessages.multipleOption
        ),
      })}
    >
      <div>
        {sortedOptions.map((option) => {
          const count = counts[option.id] ?? 0;
          const share = respondents > 0 ? count / respondents : 0;

          return (
            <BarRow
              key={option.id}
              label={localize(option.attributes.title_multiloc)}
              value={formatMessage(sharedMessages.shareAndCount, {
                percentage: Math.round(share * 100),
                count,
              })}
              share={share}
            />
          );
        })}
      </div>
    </DashboardCard>
  );
};

export default PollQuestionCard;
