import React, { memo } from 'react';
import { isEmpty } from 'lodash-es';

import { IInputsData } from 'api/analysis_inputs/types';
import useAnalysisUserById from 'api/analysis_users/useAnalysisUserById';

import Taggings from '../Taggings';
import { Box, Icon, colors, Text } from '@citizenlab/cl2-component-library';
import Divider from 'components/admin/Divider';

import T from 'components/T';
import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';
import { useParams } from 'react-router-dom';
import useAnalysis from 'api/analyses/useAnalysis';
import InputShortFieldValue from './FieldValue';
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
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
            {analysis.data.relationships.custom_fields.data
              .slice(0, 3)
              .map((customField) => (
                <Text
                  key={customField.id}
                  fontSize="s"
                  color="textSecondary"
                  m="0px"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  <InputShortFieldValue
                    customFieldId={customField.id}
                    input={input}
                    projectId={analysis.data.relationships.project?.data?.id}
                    phaseId={analysis.data.relationships.phase?.data?.id}
                  />
                </Text>
              ))}
          </Box>
        )}

        {analysis.data.attributes.participation_method === 'ideation' && (
          <Box display="flex" gap="8px">
            {typeof input.attributes.likes_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="20px" height="20px" name="vote-up" />
                <span> {input.attributes.likes_count}</span>
              </Box>
            )}
            {typeof input.attributes.dislikes_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="20px" height="20px" name="vote-down" />
                <span> {input.attributes.dislikes_count}</span>
              </Box>
            )}
            {typeof input.attributes.votes_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="20px" height="20px" name="vote-ballot" />
                <span> {input.attributes.votes_count}</span>
              </Box>
            )}
            {typeof input.attributes.comments_count === 'number' && (
              <Box display="flex" gap="4px">
                <Icon width="20px" height="20px" name="comments" />
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
