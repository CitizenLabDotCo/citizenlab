import React from 'react';
import { WrappedComponentProps } from 'react-intl';
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
  participationContextId: string;
  participationContextType: 'phase' | 'project';
  participationContextTitle: string;
}

const PollReport = ({
  participationContextId,
  participationContextType,
  participationContextTitle,
}: Props & WrappedComponentProps) => {
  const { data: pollQuestions } = usePollQuestions({
    participationContextId,
    participationContextType,
  });

  return (
    <div>
      {!isNilOrError(participationContextTitle) &&
        participationContextType === 'phase' && (
          <SubSectionTitle>{participationContextTitle}</SubSectionTitle>
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
                <QuestionReport
                  question={question}
                  participationContextId={participationContextId}
                  participationContextType={participationContextType}
                />
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
