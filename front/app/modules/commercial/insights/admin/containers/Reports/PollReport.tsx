import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import {
  GraphCard,
  GraphCardInner,
  GraphsContainer,
  NoDataContainer,
} from 'components/admin/GraphWrappers';
import QuestionReport from './QuestionReport';
import { SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import usePollQuestions from 'api/poll_questions/usePollQuestions';

interface Props {
  phaseId: string;
  phaseTitle: string;
}

const PollReport = ({ phaseId, phaseTitle }: Props) => {
  const { data: pollQuestions } = usePollQuestions({
    phaseId,
  });

  return (
    <div>
      {!isNilOrError(phaseTitle) && (
        <SubSectionTitle>{phaseTitle}</SubSectionTitle>
      )}
      <GraphsContainer>
        {!isNilOrError(pollQuestions) && pollQuestions.data.length > 0 ? (
          pollQuestions.data.map((question) => (
            <GraphCard
              className={`dynamicHeight ${
                pollQuestions.data.length === 1 ? 'fullWidth' : ''
              }`}
              key={question.id}
            >
              <GraphCardInner>
                <QuestionReport question={question} phaseId={phaseId} />
              </GraphCardInner>
            </GraphCard>
          ))
        ) : (
          <GraphCard className="dynamicHeight fullWidth">
            <GraphCardInner>
              <NoDataContainer>
                <FormattedMessage {...messages.noData} />
              </NoDataContainer>
            </GraphCardInner>
          </GraphCard>
        )}
      </GraphsContainer>
    </div>
  );
};

export default PollReport;
