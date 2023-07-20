import React from 'react';
import { map, sortBy } from 'lodash-es';
import styled from 'styled-components';

// resources

import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useLocalize from 'hooks/useLocalize';
import {
  GraphCard,
  GraphCardInner,
  GraphCardTitle,
  GraphCardHeader,
  NoDataContainer,
} from 'components/admin/GraphWrappers';
import { isNilOrError } from 'utils/helperUtils';
import useIdeasByTopic from 'api/ideas_by_topic/useIdeasByTopic';
import useCommentsByTopic from 'api/comments_by_topic/useCommentsByTopic';
import useReactionsByTopic from 'api/reactions_by_topic/useReactionsByTopic';
import { IIdeasByTopic } from 'api/ideas_by_topic/types';
import { IReactionsByTopic } from 'api/reactions_by_topic/types';
import { ICommentsByTopic } from 'api/comments_by_topic/types';

interface Props {
  projectId: string | null;
  startAt: string | null;
  endAt: string | null;
  className?: string;
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
  font-size: ${fontSizes.s}px;
  word-break: break-all;
  width: auto;
  height: 20px;
  margin-right: 10px;
  margin-bottom: ${rowGap};
`;

const ParticipationType = styled.div`
  padding: 1px;
  font-size: ${fontSizes.base}px;
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
  font-size: ${fontSizes.xs}px;
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

const ParticipationPerTopic = ({ endAt, projectId, className }: Props) => {
  const { data: ideasByTopic } = useIdeasByTopic({
    end_at: endAt,
    project: projectId ?? undefined,
    enabled: true,
  });

  const { data: commentsByTopic } = useCommentsByTopic({
    end_at: endAt,
    project: projectId ?? undefined,
    enabled: true,
  });

  const { data: reactionsByTopic } = useReactionsByTopic({
    end_at: endAt,
    project: projectId ?? undefined,
    enabled: true,
  });

  const ideasByTopicSerie =
    ideasByTopic && convertToGraphFormat('ideas')(ideasByTopic);
  const commentsByTopicSerie =
    commentsByTopic && convertToGraphFormat('comments')(commentsByTopic);
  const reactionsByTopicSerie =
    reactionsByTopic && convertToGraphFormat('total')(reactionsByTopic);

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
          {isNilOrError(reactionsByTopic) ||
          isNilOrError(commentsByTopic) ||
          isNilOrError(ideasByTopic) ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <Row>
              <Column>
                <ParticipationType />
                {ideasByTopicSerie &&
                  ideasByTopicSerie.map((topic, index) => (
                    <TopicName key={index}>
                      {localize(topic.nameMultiloc)}
                    </TopicName>
                  ))}
              </Column>
              <Column>
                <ParticipationType>
                  <FormattedMessage {...messages.inputs} />
                </ParticipationType>
                {ideasByTopicSerie &&
                  ideasByTopicSerie.map((topic, index) => (
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
                {commentsByTopicSerie &&
                  commentsByTopicSerie.map((topic, index) => (
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
                  <FormattedMessage {...messages.reactions} />
                </ParticipationType>
                {reactionsByTopicSerie &&
                  reactionsByTopicSerie.map((topic, index) => (
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

const convertToGraphFormat =
  (dataKey: string) =>
  (data: IIdeasByTopic | IReactionsByTopic | ICommentsByTopic) => {
    const { series, topics } = data.data.attributes;
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

export default ParticipationPerTopic;
