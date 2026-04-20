import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  IconTooltip,
  Title,
  Tooltip,
  colors,
  Error,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IFlatCustomField } from 'api/custom_fields/types';
import useUpdateCustomField from 'api/custom_fields/useUpdateCustomFields';
import useCustomForm from 'api/custom_form/useCustomForm';
import { IPhaseData } from 'api/phases/types';

import useSuperAdmin from 'hooks/useSuperAdmin';

import { transformFieldForSubmission } from 'components/FormBuilder/edit/utils';
import Modal from 'components/UI/Modal';
import TextArea from 'components/UI/TextArea';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { replaceIdsWithNewUuids, replaceUuidsInText } from './utils';

const CodeTextArea = styled(TextArea)`
  .TextArea textarea {
    font-family: 'Courier New', Courier, monospace !important;
    background-color: ${colors.grey100};
  }
`;

type Props = {
  customFields: IFlatCustomField[];
  projectId: string;
  phase: IPhaseData;
  isFormPhaseSpecific: boolean;
  onSaveSuccess?: () => void;
};

// NOTE: This modal allows editing the JSON of custom fields directly.
// It can only be used by super admins (mainly for analysing and fixing issues)
const EditSchemaButtonWithModal = ({
  customFields,
  projectId,
  phase,
  isFormPhaseSpecific,
  onSaveSuccess,
}: Props) => {
  const { formatMessage } = useIntl();
  const isSuperAdmin = useSuperAdmin();
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { mutateAsync: updateFormCustomFields } = useUpdateCustomField();
  const { data: customForm } = useCustomForm(phase);
  const { data: appConfig } = useAppConfiguration();

  useEffect(() => {
    if (showModal) {
      const transformed = customFields.map((field) =>
        transformFieldForSubmission(field, customFields)
      );
      setJsonText(JSON.stringify(transformed, null, 2));
      setError(null);
      setCopied(false);
    }
  }, [showModal, customFields]);

  // Only render if super admin
  if (!isSuperAdmin) return null;

  const handleCopy = () => {
    try {
      const parsed = JSON.parse(jsonText) as IFlatCustomField[];
      const withNewIds = replaceIdsWithNewUuids(parsed);
      navigator.clipboard.writeText(JSON.stringify(withNewIds, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      setError(formatMessage(messages.schemaParseError));
    }
  };

  // Native copy also needs to be handed to ensure that we can never directly
  // copy & paste the same IDs to different platforms - causes metabase issues
  const handleNativeCopy = (e: React.ClipboardEvent) => {
    const selection = window.getSelection()?.toString();
    if (!selection) return;
    e.preventDefault();
    let rewritten: string;
    try {
      const parsed = JSON.parse(selection) as IFlatCustomField[];
      rewritten = JSON.stringify(replaceIdsWithNewUuids(parsed), null, 2);
    } catch {
      rewritten = replaceUuidsInText(selection);
    }
    e.clipboardData.setData('text/plain', rewritten);
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const parsed = JSON.parse(jsonText);

      await updateFormCustomFields(
        {
          projectId,
          phaseId: isFormPhaseSpecific ? phase.id : undefined,
          customFields: parsed,
          customForm: {
            saveType: 'schema',
            fieldsLastUpdatedAt:
              customForm?.data.attributes.fields_last_updated_at,
          },
        },
        {
          onSuccess: () => {
            onSaveSuccess?.();
            setShowModal(false);
          },
        }
      );
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(formatMessage(messages.schemaParseError));
      } else {
        setError(String(e));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if saving should be disabled
  const lifecycleStage =
    appConfig?.data.attributes.settings.core.lifecycle_stage;
  const hasResponses = phase.attributes.ideas_count > 0;
  const isProduction = process.env.NODE_ENV === 'production';
  const isSaveDisabled =
    isProduction && lifecycleStage === 'active' && hasResponses;

  return (
    <>
      <Button
        buttonStyle="secondary-outlined"
        icon="code"
        mr="20px"
        onClick={() => setShowModal(true)}
      >
        <FormattedMessage {...messages.schemaEdit} />
      </Button>
      <Modal
        opened={showModal}
        close={() => setShowModal(false)}
        width="800px"
        ariaLabelledBy="edit-schema-modal-title"
      >
        <Box p="24px">
          <Title id="edit-schema-modal-title" variant="h3" mb="16px">
            <FormattedMessage {...messages.schemaEdit} />
          </Title>

          <Box onCopy={handleNativeCopy}>
            <CodeTextArea
              value={jsonText}
              onChange={(value) => setJsonText(value)}
              maxRows={20}
            />
          </Box>

          {error && <Error text={error} marginTop="8px" marginBottom="0" />}

          <Box display="flex" gap="12px" mt="16px" justifyContent="flex-end">
            <Button
              buttonStyle="secondary-outlined"
              onClick={() => setShowModal(false)}
            >
              <FormattedMessage {...messages.schemaCancelEdit} />
            </Button>
            <Button
              buttonStyle="secondary-outlined"
              icon={copied ? 'check' : 'copy'}
              onClick={handleCopy}
            >
              <Box display="flex" alignItems="center" gap="4px">
                {copied ? (
                  <FormattedMessage {...messages.schemaCopied} />
                ) : (
                  <FormattedMessage {...messages.schemaCopy} />
                )}
                <IconTooltip
                  content={formatMessage(messages.schemaCopyTooltip)}
                />
              </Box>
            </Button>
            <Tooltip
              disabled={!isSaveDisabled}
              content={formatMessage(messages.schemaSaveDisabled)}
            >
              <Button
                buttonStyle="admin-dark"
                onClick={handleSave}
                processing={isSaving}
                disabled={isSaveDisabled}
              >
                <FormattedMessage {...messages.schemaSave} />
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default EditSchemaButtonWithModal;
