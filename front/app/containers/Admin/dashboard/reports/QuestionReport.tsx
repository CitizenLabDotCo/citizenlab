import { IGraphPoint } from 'cl2-component-library/dist/utils/typings';
import useLocalize from 'hooks/useLocalize';
import usePollResponses from 'hooks/usePollResponses';
import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { InjectedIntlProps } from 'react-intl';
import GetPollOptions, {
  GetPollOptionsChildProps,
} from 'resources/GetPollOptions';
import { IPollQuestion } from 'services/pollQuestions';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import ResponseGraph from './charts/ResponseGraph';

interface InputProps {
  question: IPollQuestion;
  participationContextId: string;
  participationContextType: 'phase' | 'project';
}
interface DataProps {
  pollOptions: GetPollOptionsChildProps;
}

interface Props extends InputProps, DataProps {}

const QuestionReport = memo(
  ({
    pollOptions,
    question,
    participationContextId,
    participationContextType,
  }: Props & InjectedIntlProps) => {
    const localize = useLocalize();

    const getPollResponsesSerie = (question: IPollQuestion) => {
      const serie: IGraphPoint[] | undefined =
        isNilOrError(pollResponses) || isNilOrError(pollOptions)
          ? undefined
          : question.relationships.options.data.map((relOption) => {
              const option = pollOptions.find(
                (fullOption) => fullOption && relOption.id === fullOption.id
              )?.attributes.title_multiloc;
              return {
                code: relOption.id,
                value: pollResponses.series.options[relOption.id],
                name: option ? localize(option) : 'TODOfallbacksomehow',
              };
            });
      return serie;
    };

    const pollResponses = usePollResponses({
      participationContextId,
      participationContextType,
    });

    return (
      <ResponseGraph
        key={question.id}
        serie={getPollResponsesSerie(question)}
        graphTitleString={localize(question.attributes.title_multiloc)}
        graphUnit="responses"
        className="dynamicHeight"
      />
    );
  }
);

const Data = adopt<DataProps, InputProps>({
  pollOptions: ({ question, render }) => (
    <GetPollOptions questionId={question.id}>{render}</GetPollOptions>
  ),
});

const QuestionGraphWithHoc = injectIntl(QuestionReport);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <QuestionGraphWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
