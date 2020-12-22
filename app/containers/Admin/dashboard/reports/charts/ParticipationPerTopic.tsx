import React from 'react';
import { adopt } from 'react-adopt';
import { map, sortBy } from 'lodash-es';
import styled from 'styled-components';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';
import {
  IIdeasByTopic,
  ideasByTopicStream,
  ICommentsByTopic,
  commentsByTopicStream,
  IVotesByTopic,
  votesByTopicStream,
} from 'services/stats';
import { IParticipationByTopic } from 'typings';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from '../../messages';
import useLocalize from 'hooks/useLocalize';
import {
  GraphCard,
  GraphCardInner,
  GraphCardTitle,
  GraphCardHeader,
  NoDataContainer,
} from '../..';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  projectId: string | null;
  startAt: string | null;
  endAt: string | null;
  className?: string;
}

interface DataProps {
  ideasByTopic: {
    serie: IParticipationByTopic;
  };
  commentsByTopic: {
    serie: IParticipationByTopic;
  };
  votesByTopic: {
    serie: IParticipationByTopic;
  };
}

const cellWidth = '100px';
const rowGap = '10px';

const Column = styled.div`
  display: inline-flex;
  flex-direction: column;
`;
const Row = styled.div`
  display: inline-flex;
  flex-direction: row;
  margin: auto;
`;

const TopicName = styled.div`
  padding: 1px;
  font-size: ${fontSizes.small};
  word-break: break-all;
  width: auto;
  height: 20px;
  margin-right: 10px;
  margin-bottom: ${rowGap};
`;

const ParticipationType = styled.div`
  padding: 1px;
  font-size: ${fontSizes.base};
  width: ${cellWidth};
  height: 20px;
  text-align: center;
  margin-bottom: ${rowGap};
`;

const Cell = styled.div<{ cellColor: string }>`
  background-color: ${(props) => {
    return props.cellColor;
  }};
  height: 20px;
  width: cellWidth;
  border: 1px solid #f1f1f1;
  border-radius: 2px;
  margin-bottom: ${rowGap};
  transition: 0.3s;
  :hover {
    background-color: ${colors.background};
  }
`;

const Value = styled.p`
  margin: auto;
  font-size: ${fontSizes.xs};
  text-align: center;
  opacity: 0;
  :hover {
    opacity: 1;
  }
`;

const getCellColor = (value, participationType) => {
  const saturation =
    (value / maxParticipationValue[participationType]) * 50 + 49;
  const luminosity =
    100 - ((value / maxParticipationValue[participationType]) * 60 + 5);
  return `hsl(185, ${saturation}%, ${luminosity}%)`;
};

interface Props extends InputProps, DataProps, InjectedLocalized {}

const ParticipationPerTopic = (props: Props) => {
  const { votesByTopic, commentsByTopic, ideasByTopic, className } = props;
  const localize = useLocalize();
  return (
    <>
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.participationPerTopic} />
            </GraphCardTitle>
          </GraphCardHeader>
          {isNilOrError(votesByTopic) ||
          isNilOrError(commentsByTopic) ||
          isNilOrError(ideasByTopic) ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <Row>
              <Column>
                <ParticipationType />
                {ideasByTopic.serie &&
                  ideasByTopic.serie.map((topic, index) => (
                    <TopicName key={index}>
                      {localize(topic.nameMultiloc)}
                    </TopicName>
                  ))}
              </Column>
              <Column>
                <ParticipationType>
                  <FormattedMessage {...messages.inputs} />
                </ParticipationType>
                {ideasByTopic.serie &&
                  ideasByTopic.serie.map((topic, index) => (
                    <Cell
                      key={index}
                      cellColor={getCellColor(topic.value, 'ideas')}
                    >
                      <Value>{topic.value}</Value>
                    </Cell>
                  ))}
              </Column>
              <Column>
                <ParticipationType>
                  <FormattedMessage {...messages.comments} />
                </ParticipationType>
                {commentsByTopic.serie &&
                  commentsByTopic.serie.map((topic, index) => (
                    <Cell
                      key={index}
                      cellColor={getCellColor(topic.value, 'comments')}
                    >
                      <Value>{topic.value}</Value>
                    </Cell>
                  ))}
              </Column>
              <Column>
                <ParticipationType>
                  <FormattedMessage {...messages.votes} />
                </ParticipationType>
                {votesByTopic.serie &&
                  votesByTopic.serie.map((topic, index) => (
                    <Cell
                      key={index}
                      cellColor={getCellColor(topic.value, 'total')}
                    >
                      <Value>{topic.value}</Value>
                    </Cell>
                  ))}
              </Column>
            </Row>
          )}
        </GraphCardInner>
      </GraphCard>
    </>
  );
};

const maxParticipationValue = {};

const convertToGraphFormat = (dataKey: string) => (
  data: IIdeasByTopic | IVotesByTopic | ICommentsByTopic
) => {
  const { series, topics } = data;
  maxParticipationValue[dataKey] = 0;
  const mapped = map(topics, ({ title_multiloc }, topicId: string) => {
    if (series[dataKey][topicId] > maxParticipationValue[dataKey]) {
      maxParticipationValue[dataKey] = series[dataKey][topicId];
    }
    return {
      nameMultiloc: title_multiloc,
      value: series[dataKey][topicId] || (0 as number),
      code: topicId,
    };
  });

  const res = sortBy(mapped, 'code');

  return res.length > 0 ? res : null;
};

const Data = adopt<DataProps, InputProps>({
  ideasByTopic: ({ projectId, endAt, render }) => (
    <GetSerieFromStream
      currentProjectFilter={projectId}
      stream={ideasByTopicStream}
      endAt={endAt}
      convertToGraphFormat={convertToGraphFormat('ideas')}
    >
      {render}
    </GetSerieFromStream>
  ),
  commentsByTopic: ({ projectId, endAt, render }) => (
    <GetSerieFromStream
      currentProjectFilter={projectId}
      stream={commentsByTopicStream}
      endAt={endAt}
      convertToGraphFormat={convertToGraphFormat('comments')}
    >
      {render}
    </GetSerieFromStream>
  ),
  votesByTopic: ({ projectId, endAt, render }) => (
    <GetSerieFromStream
      currentProjectFilter={projectId}
      stream={votesByTopicStream}
      endAt={endAt}
      convertToGraphFormat={convertToGraphFormat('total')}
    >
      {render}
    </GetSerieFromStream>
  ),
});

const ParticipationPerTopicWithHOCs = injectIntl(
  injectLocalize(ParticipationPerTopic)
);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(serie) => {
      return <ParticipationPerTopicWithHOCs {...serie} {...inputProps} />;
    }}
  </Data>
);
