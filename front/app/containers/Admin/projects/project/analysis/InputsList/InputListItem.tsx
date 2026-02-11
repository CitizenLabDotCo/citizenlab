import React, { memo } from 'react';

import {
  Box,
  Icon,
  colors,
  Text,
  Divider,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';

import useAnalysis from 'api/analyses/useAnalysis';
import { IInputsData } from 'api/analysis_inputs/types';
import useAnalysisUserById from 'api/analysis_users/useAnalysisUserById';

import T from 'components/T';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { useParams } from 'utils/router';
import { getFullName } from 'utils/textUtils';

import Taggings from '../Taggings';
import tracks from '../tracks';

import InputShortFieldValue from './FieldValue';
import messages from './messages';

interface Props {
  input: IInputsData;
  onSelect: (id: string) => void;
  selected: boolean;
}

const InputListItem = memo(({ input, onSelect, selected }: Props) => {
  const { analysisId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });
  const { data: analysis } = useAnalysis(analysisId);
  const { data: author } = useAnalysisUserById({
    id: input.relationships.author.data?.id ?? null,
    analysisId,
  });
  const methodConfig =
    analysis && getMethodConfig(analysis.data.attributes.participation_method);
  const showLikes = methodConfig?.supportsReactions;
  const showVotes = methodConfig?.supportsVotes;
  const showComments = methodConfig?.supportsComments;

  const { formatDate, formatMessage } = useIntl();

  const showAuthor = author && author.data.attributes.first_name;

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!analysis || !input) return null;

  const { title_multiloc } = input.attributes;

  const mainCustomFieldId =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    analysis.data.relationships.main_custom_field?.data?.id;

  return (
    <Box data-cy="e2e-analysis-input-item">
      <Box
        id={`input-${input.id}`}
        onClick={() => {
          onSelect(input.id);
          trackEventByName(tracks.inputPreviewedFromList, {
            inputId: input.id,
          });
        }}
        bg={selected ? colors.background : colors.white}
        p="12px"
        display="flex"
        flexDirection="column"
        gap="8px"
        style={{ cursor: 'pointer' }}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          gap="8px"
          justifyContent="space-between"
        >
          {!title_multiloc ||
            (isEmpty(title_multiloc) && showAuthor && (
              <Text m="0px">{getFullName(author.data)}</Text>
            ))}
          {!title_multiloc ||
            (isEmpty(title_multiloc) && !showAuthor && (
              <Text m="0px">{formatMessage(messages.anonymous)}</Text>
            ))}
          {title_multiloc && (
            <Text m="0px">
              <T value={title_multiloc} />
            </Text>
          )}
          <Text color="textSecondary" fontSize="s" m="0px">
            {formatDate(input.attributes.published_at)}
          </Text>
        </Box>

        {(!title_multiloc || isEmpty(title_multiloc)) && (
          <Box flex="1" w="100%">
            {mainCustomFieldId && (
              <Text
                fontSize="s"
                color="textSecondary"
                m="0px"
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap"
              >
                <InputShortFieldValue
                  customFieldId={mainCustomFieldId}
                  input={input}
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  projectId={analysis.data.relationships.project?.data?.id}
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  phaseId={analysis.data.relationships.phase?.data?.id}
                />
              </Text>
            )}
          </Box>
        )}

        {(showLikes || showVotes || showComments) && (
          <Box display="flex" gap="8px">
            {showLikes && typeof input.attributes.likes_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="16px" height="16px" name="vote-up" />
                <span> {input.attributes.likes_count}</span>
              </Box>
            )}
            {showLikes &&
              typeof input.attributes.dislikes_count === 'number' && (
                <Box display="flex" gap="4px">
                  <Icon width="16px" height="16px" name="vote-down" />
                  <span> {input.attributes.dislikes_count}</span>
                </Box>
              )}
            {showVotes && typeof input.attributes.votes_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="16px" height="16px" name="vote-ballot" />
                <span> {input.attributes.votes_count}</span>
              </Box>
            )}
            {showComments &&
              typeof input.attributes.comments_count === 'number' && (
                <Box display="flex" gap="4px">
                  <Icon width="16px" height="16px" name="comments" />
                  <span> {input.attributes.comments_count}</span>
                </Box>
              )}
          </Box>
        )}

        <Taggings inputId={input.id} />
      </Box>
      <Divider m="0px" />
    </Box>
  );
});

export default InputListItem;
