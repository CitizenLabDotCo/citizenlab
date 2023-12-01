import { IGraphPoint } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import usePollOptions from 'api/poll_options/usePollOptions';
import usePollResponses from 'api/poll_responses/usePollResponses';
import React, { memo } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { IPollQuestionData } from 'api/poll_questions/types';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import ResponseGraph from './Charts/ResponseGraph';

interface Props {
  question: IPollQuestionData;
  phaseId: string;
}

const QuestionReport = memo(
  ({ question, phaseId }: Props & WrappedComponentProps) => {
    const localize = useLocalize();

    const { data: pollOptions } = usePollOptions(question.id);
    const { data: pollResponses } = usePollResponses({
      phaseId,
    });

    const getPollResponsesSerie = (question: IPollQuestionData) => {
      const serie: IGraphPoint[] | undefined =
        isNilOrError(pollResponses) || !pollOptions
          ? undefined
          : question.relationships.options.data.map((relOption) => {
              const option = pollOptions.data.find(
                (fullOption) => fullOption && relOption.id === fullOption.id
              )?.attributes.title_multiloc;
              return {
                code: relOption.id,
                value:
                  pollResponses.data.attributes.series.options[relOption.id],
                name: option ? localize(option) : 'TODOfallbacksomehow',
              };
            });
      return serie;
    };

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

export default injectIntl(QuestionReport);
