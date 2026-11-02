import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';
import { supportsPublicAnswers } from 'api/custom_fields/util';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import ManagersOnlyAnswerNote from 'components/CustomFieldsForm/ManagersOnlyAnswerNote';
import { isUserField } from 'components/CustomFieldsForm/util';

import { FormattedMessage } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from '../../messages';
import BodySectionTitle from '../BodySectionTitle';

import AnswersForm from './AnswersForm';
import AnswerValue from './AnswerValue';

interface Props {
  ideaId: string;
  project: IProjectData;
  compact: boolean;
}

const CustomFieldAnswers = ({ ideaId, project, compact }: Props) => {
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { data: customFields } = useCustomFields({
    // Ideas of transitive methods have no creation phase yet, so they
    // fall back to the project's form.
    phaseId: idea?.data.relationships.creation_phase.data?.id,
    projectId: project.id,
    publicFields: true,
  });
  const canModerate = usePermission({ item: project, action: 'moderate' });

  if (!idea || !customFields) return null;

  // A private question without an answer is either skipped or withheld from
  // the user. Temporary until skipped questions are stored as answers too.
  const isAuthor =
    !!authUser && idea.data.relationships.author?.data?.id === authUser.data.id;
  const seesPrivateAnswers = canModerate || isAuthor;

  const answers: Record<string, unknown> = idea.data.attributes;
  const rows = customFields.flatMap((field) => {
    if (
      field.code ||
      !supportsPublicAnswers(field.input_type) ||
      isUserField(field)
    ) {
      return [];
    }

    const answer = answers[field.key];
    const isPrivate = field.answers_visible_to !== 'public';
    if (answer === undefined && isPrivate && !seesPrivateAnswers) return [];

    return [{ field, answer }];
  });

  if (rows.length === 0) return null;

  return (
    <Box mb={compact ? '12px' : '40px'}>
      <BodySectionTitle>
        <FormattedMessage {...messages.moreFromThisSubmission} />
      </BodySectionTitle>
      <AnswersForm answers={answers}>
        {rows.map(({ field, answer }) => (
          <Box
            key={field.key}
            py="16px"
            borderTop={`1px solid ${colors.divider}`}
            data-cy="e2e-custom-field-answer"
          >
            <Text m="0px" mb="4px" fontSize="s" color="textSecondary">
              {localize(field.title_multiloc)}
            </Text>
            {field.answers_visible_to !== 'public' && (
              <ManagersOnlyAnswerNote />
            )}
            {answer === undefined ? (
              <Text m="0px" color="textSecondary">
                <FormattedMessage {...messages.notAnswered} />
              </Text>
            ) : (
              <AnswerValue field={field} answer={answer} />
            )}
          </Box>
        ))}
      </AnswersForm>
    </Box>
  );
};

export default CustomFieldAnswers;
