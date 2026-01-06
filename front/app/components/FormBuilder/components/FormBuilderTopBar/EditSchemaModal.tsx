import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  IconTooltip,
  Text,
  Title,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
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
  font-family: 'Courier New', Courier, monospace !important;
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
  const { data: appConfig } = useAppConfiguration();

  const lifecycleStage =
    appConfig?.data.attributes.settings.core.lifecycle_stage;
  const hasResponses = phase.attributes.ideas_count > 0;
  const isProduction = process.env.NODE_ENV === 'production';
  const isSaveDisabled =
    isProduction && lifecycleStage === 'active' && hasResponses;

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

  const replaceIdsWithNewUuids = (fields: unknown[]): unknown[] => {
    const idMapping: Record<string, string> = {};

    // First pass: collect all IDs and generate new UUIDs
    const collectIds = (obj: unknown): void => {
      if (Array.isArray(obj)) {
        obj.forEach(collectIds);
        return;
      }
      if (obj && typeof obj === 'object') {
        const record = obj as Record<string, unknown>;
        if (typeof record.id === 'string' && record.id) {
          idMapping[record.id] = uuidv4();
        }
        Object.values(record).forEach(collectIds);
      }
    };
    collectIds(fields);

    // Second pass: replace IDs and update logic references
    const replaceIds = (obj: unknown): unknown => {
      if (Array.isArray(obj)) {
        return obj.map(replaceIds);
      }
      if (obj && typeof obj === 'object') {
        const record = obj as Record<string, unknown>;
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(record)) {
          if (key === 'id' && typeof value === 'string' && value) {
            result[key] = idMapping[value] ?? null;
          } else if (key === 'logic' && value && typeof value === 'object') {
            // Update logic references
            const logic = value as Record<string, unknown>;
            const newLogic: Record<string, unknown> = {};

            if (
              logic.next_page_id &&
              typeof logic.next_page_id === 'string' &&
              idMapping[logic.next_page_id]
            ) {
              newLogic.next_page_id = idMapping[logic.next_page_id];
            } else if (logic.next_page_id !== undefined) {
              newLogic.next_page_id = logic.next_page_id;
            }

            if (Array.isArray(logic.rules)) {
              newLogic.rules = logic.rules.map((rule) => {
                const typedRule = rule as Record<string, unknown>;
                const newRule: Record<string, unknown> = { ...typedRule };

                // Update goto_page_id
                if (
                  typeof typedRule.goto_page_id === 'string' &&
                  idMapping[typedRule.goto_page_id]
                ) {
                  newRule.goto_page_id = idMapping[typedRule.goto_page_id];
                }

                // Update 'if' field if it's an option ID (string)
                if (
                  typeof typedRule.if === 'string' &&
                  idMapping[typedRule.if]
                ) {
                  newRule.if = idMapping[typedRule.if];
                }

                return newRule;
              });
            }

            result[key] = newLogic;
          } else {
            result[key] = replaceIds(value);
          }
        }
        return result;
      }
      return obj;
    };

    return replaceIds(fields) as unknown[];
  };

  const handleCopy = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const withNewIds = replaceIdsWithNewUuids(parsed);
      navigator.clipboard.writeText(JSON.stringify(withNewIds, null, 2));
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
          saveType: 'schema',
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
          <Tooltip
            disabled={!isSaveDisabled}
            content={formatMessage(messages.saveDisabledActivePlatform)}
          >
            <Button
              buttonStyle="admin-dark"
              onClick={handleSave}
              processing={isSaving}
              disabled={isSaveDisabled}
            >
              <FormattedMessage {...messages.saveSchema} />
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditSchemaModal;
