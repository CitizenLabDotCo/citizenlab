import React, { memo } from 'react';

import { Box, Icon, colors, Text } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useParams } from 'react-router-dom';

import useAnalysis from 'api/analyses/useAnalysis';
import { IInputsData } from 'api/analysis_inputs/types';
import useAnalysisUserById from 'api/analysis_users/useAnalysisUserById';

import Divider from 'components/admin/Divider';
import T from 'components/T';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
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
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysis } = useAnalysis(analysisId);
  const { data: author } = useAnalysisUserById({
    id: input.relationships.author.data?.id ?? null,
    analysisId,
  });
  const { formatDate, formatMessage } = useIntl();

  if (!analysis || !input) return null;

  const { title_multiloc } = input.attributes;

  const mainCustomFieldId =
    analysis.data.relationships.main_custom_field?.data?.id;

  return (
    <Box data-cy="e2e-analysis-input-item">
      <Box
        id={`input-${input.id}`}
        onClick={() => {
          onSelect(input.id);
          trackEventByName(tracks.inputPreviewedFromList.name, {
            extra: { inputId: input.id },
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
            (isEmpty(title_multiloc) && author && (
              <Text m="0px">{getFullName(author.data)}</Text>
            ))}
          {!title_multiloc ||
            (isEmpty(title_multiloc) && !author && (
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
                  projectId={analysis.data.relationships.project?.data?.id}
                  phaseId={analysis.data.relationships.phase?.data?.id}
                />
              </Text>
            )}
          </Box>
        )}

        {analysis.data.attributes.participation_method === 'ideation' && (
          <Box display="flex" gap="8px">
            {typeof input.attributes.likes_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="16px" height="16px" name="vote-up" />
                <span> {input.attributes.likes_count}</span>
              </Box>
            )}
            {typeof input.attributes.dislikes_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="16px" height="16px" name="vote-down" />
                <span> {input.attributes.dislikes_count}</span>
              </Box>
            )}
            {typeof input.attributes.votes_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="16px" height="16px" name="vote-ballot" />
                <span> {input.attributes.votes_count}</span>
              </Box>
            )}
            {typeof input.attributes.comments_count === 'number' && (
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
