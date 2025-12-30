import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  IconTooltip,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';
import useUpdateCustomField from 'api/custom_fields/useUpdateCustomFields';
import useCustomForm from 'api/custom_form/useCustomForm';
import { IPhaseData } from 'api/phases/types';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { transformFieldForSubmission } from '../../edit/utils';

import messages from './messages';

const CodeTextarea = styled.textarea`
  width: 100%;
  min-height: 400px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  background-color: ${colors.grey100};
  border: 1px solid ${colors.borderLight};
  border-radius: 4px;
  padding: 12px;
  resize: vertical;
  white-space: pre;
  overflow-x: auto;
`;

const ErrorText = styled(Text)`
  color: ${colors.red600};
`;

type Props = {
  opened: boolean;
  onClose: () => void;
  customFields: IFlatCustomField[];
  projectId: string;
  phase: IPhaseData;
  isFormPhaseSpecific: boolean;
  onSaveSuccess?: () => void;
};

const EditSchemaModal = ({
  opened,
  onClose,
  customFields,
  projectId,
  phase,
  isFormPhaseSpecific,
  onSaveSuccess,
}: Props) => {
  const { formatMessage } = useIntl();
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: updateFormCustomFields } = useUpdateCustomField();
  const { data: customForm } = useCustomForm(phase);

  useEffect(() => {
    if (opened) {
      const transformed = customFields.map((field) =>
        transformFieldForSubmission(field, customFields)
      );
      setJsonText(JSON.stringify(transformed, null, 2));
      setError(null);
      setCopied(false);
    }
  }, [opened, customFields]);

  const clearIds = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(clearIds);
    }
    if (obj && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'id') {
          result[key] = null;
        } else {
          result[key] = clearIds(value);
        }
      }
      return result;
    }
    return obj;
  };

  const handleCopy = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const cleared = clearIds(parsed);
      navigator.clipboard.writeText(JSON.stringify(cleared, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      setError(formatMessage(messages.schemaParseError));
    }
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const parsed = JSON.parse(jsonText);

      await updateFormCustomFields({
        projectId,
        phaseId: isFormPhaseSpecific ? phase.id : undefined,
        customFields: parsed,
        customForm: {
          saveType: 'manual',
          fieldsLastUpdatedAt:
            customForm?.data.attributes.fields_last_updated_at,
        },
      });

      onSaveSuccess?.();
      onClose();
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

  return (
    <Modal opened={opened} close={onClose} width="800px">
      <Box p="24px">
        <Title variant="h3" mb="16px">
          <FormattedMessage {...messages.editSchemaTitle} />
        </Title>

        <CodeTextarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
        />

        {error && (
          <ErrorText mt="8px" mb="0">
            {error}
          </ErrorText>
        )}

        <Box display="flex" gap="12px" mt="16px" justifyContent="flex-end">
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            <FormattedMessage {...messages.cancelEditSchema} />
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
                <FormattedMessage {...messages.copySchema} />
              )}
              <IconTooltip
                content={formatMessage(messages.copySchemaTooltip)}
              />
            </Box>
          </Button>
          <Button
            buttonStyle="admin-dark"
            onClick={handleSave}
            processing={isSaving}
          >
            <FormattedMessage {...messages.saveSchema} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditSchemaModal;
