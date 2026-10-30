import React, { useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';

import useLocalize from 'hooks/useLocalize';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import actionFormMessages from 'components/admin/ActionForm/messages';
import formBuilderMessages from 'components/FormBuilder/components/messages';
import { getTranslatedStringKey } from 'components/FormBuilder/utils';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import PanelField from './PanelField';
import useOpenInputForm from './useOpenInputForm';

interface Props {
  projectId: string;
  phaseId: string;
  title: string;
  survey: boolean;
}

const FormQuestionsCard = ({ projectId, phaseId, title, survey }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [open, setOpen] = useState(false);
  const { data: customFields } = useCustomFields({ projectId, phaseId });
  // Survey forms belong to their phase, so only the input form can be shared.
  const inputForm = useOpenInputForm(projectId, phaseId);

  const questions = (customFields ?? []).filter(
    (field) => field.enabled && field.input_type !== 'page'
  );
  const nQuestions = questions.length;

  return (
    <>
      <PanelField
        label={title}
        action={
          customFields &&
          !open && (
            <SummaryPill
              label={formatMessage(actionFormMessages.nQuestions, {
                nQuestions,
              })}
            />
          )
        }
        button={{
          icon: open ? 'chevron-up' : 'chevron-down',
          expanded: open,
          onClick: () => setOpen((open) => !open),
        }}
      >
        {open && (
          <>
            <Box as="ol" m="0" p="0" style={{ listStyle: 'none' }}>
              {questions.map((question, index) => {
                const type = getTranslatedStringKey(
                  question.input_type,
                  question.key
                );
                const details = [
                  type && formatMessage(type),
                  question.required &&
                    formatMessage(formBuilderMessages.required),
                ].filter(Boolean);

                return (
                  <Box
                    as="li"
                    key={question.id}
                    display="flex"
                    alignItems="center"
                    gap="12px"
                    py="10px"
                    borderBottom={`1px solid ${colors.grey200}`}
                  >
                    <Text as="span" variant="boHelper" m="0" minWidth="16px">
                      {index + 1}
                    </Text>
                    <Box flexGrow={1}>
                      <Text as="span" variant="boControl" m="0">
                        {localize(question.title_multiloc)}
                      </Text>
                    </Box>
                    <Text as="span" variant="boHelper" m="0" textAlign="right">
                      {details.join(' · ')}
                    </Text>
                  </Box>
                );
              })}
            </Box>
            <Box display="flex">
              {survey ? (
                <ButtonWithLink
                  buttonStyle="bo-secondary"
                  boSize="medium"
                  width="auto"
                  to="/admin/projects/$projectId/phases/$phaseId/survey-form/edit"
                  params={{ projectId, phaseId }}
                >
                  {formatMessage(messages.editForm)}
                </ButtonWithLink>
              ) : (
                <Button
                  buttonStyle="bo-secondary"
                  boSize="medium"
                  width="auto"
                  disabled={!inputForm.ready}
                  onClick={inputForm.open}
                >
                  {formatMessage(messages.editForm)}
                </Button>
              )}
            </Box>
          </>
        )}
      </PanelField>
      {inputForm.warningModal}
    </>
  );
};

export default FormQuestionsCard;
