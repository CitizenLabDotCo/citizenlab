import React, { ReactNode, useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';

import useLocalize from 'hooks/useLocalize';

import actionFormMessages from 'components/admin/ActionForm/messages';
import formBuilderMessages from 'components/FormBuilder/components/messages';
import { getTranslatedStringKey } from 'components/FormBuilder/utils';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import PanelField from './PanelField';
import SummaryPill from './SummaryPill';

interface Props {
  projectId: string;
  phaseId: string;
  title: string;
  survey: boolean;
  /** Shown under the questions whether or not the list is open. */
  children?: ReactNode;
}

const FormQuestionsCard = ({
  projectId,
  phaseId,
  title,
  survey,
  children,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [open, setOpen] = useState(false);
  const { data: customFields } = useCustomFields({ projectId, phaseId });

  const questions = (customFields ?? []).filter(
    (field) => field.enabled && field.input_type !== 'page'
  );
  const nQuestions = questions.length;

  return (
    <PanelField
      label={title}
      action={
        <Box display="flex" alignItems="center" gap="4px">
          {customFields && !open && (
            <SummaryPill
              label={formatMessage(actionFormMessages.nQuestions, {
                nQuestions,
              })}
            />
          )}
          <Button
            buttonStyle="bo-text"
            icon={open ? 'chevron-up' : 'chevron-down'}
            iconSize="16px"
            width="28px"
            height="28px"
            padding="0"
            ariaLabel={title}
            ariaExpanded={open}
            onClick={() => setOpen((open) => !open)}
          />
        </Box>
      }
    >
      {(open || children) && (
        <>
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
                      <Text
                        as="span"
                        variant="boHelper"
                        m="0"
                        textAlign="right"
                      >
                        {details.join(' · ')}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
              <Box display="flex">
                <ButtonWithLink
                  buttonStyle="bo-secondary"
                  boSize="medium"
                  width="auto"
                  to={
                    survey
                      ? '/admin/projects/$projectId/phases/$phaseId/survey-form/edit'
                      : '/admin/projects/$projectId/phases/$phaseId/form/edit'
                  }
                  params={{ projectId, phaseId }}
                >
                  {formatMessage(messages.editForm)}
                </ButtonWithLink>
              </Box>
            </>
          )}
          {children}
        </>
      )}
    </PanelField>
  );
};

export default FormQuestionsCard;
