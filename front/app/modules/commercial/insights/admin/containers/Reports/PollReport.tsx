import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { InjectedIntlProps } from 'react-intl';
import GetPollQuestions, {
  GetPollQuestionsChildProps,
} from 'resources/GetPollQuestions';
import { isNilOrError } from 'utils/helperUtils';
import {
  GraphCard,
  GraphCardInner,
  GraphsContainer,
  NoDataContainer,
} from 'components/admin/Chart';
import QuestionReport from './QuestionReport';
import { SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

interface InputProps {
  participationContextId: string;
  participationContextType: 'phase' | 'project';
  participationContextTitle: string;
}
interface DataProps {
  pollQuestions: GetPollQuestionsChildProps;
}

interface Props extends InputProps, DataProps {}

const PollReport = memo(
  ({
    participationContextId,
    participationContextType,
    pollQuestions,
    participationContextTitle,
  }: Props & InjectedIntlProps) => {
    return (
      <div>
        {!isNilOrError(participationContextTitle) &&
          participationContextType === 'phase' && (
            <SubSectionTitle>{participationContextTitle}</SubSectionTitle>
          )}
        <GraphsContainer>
          {!isNilOrError(pollQuestions) && pollQuestions.length > 0 ? (
            pollQuestions.map((question) => (
              <GraphCard
                className={`dynamicHeight ${
                  pollQuestions.length === 1 ? 'fullWidth' : ''
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
  }
);

const Data = adopt<DataProps, InputProps>({
  pollQuestions: ({
    participationContextId,
    participationContextType,
    render,
  }) => (
    <GetPollQuestions
      participationContextId={participationContextId}
      participationContextType={participationContextType}
    >
      {render}
    </GetPollQuestions>
  ),
});

const PollReportWithHoc = injectIntl(PollReport);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <PollReportWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
