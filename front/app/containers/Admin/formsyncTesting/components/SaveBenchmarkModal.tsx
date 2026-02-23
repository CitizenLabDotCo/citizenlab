import React, { useState } from 'react';

import {
  Box,
  Text,
  Title,
  Button,
  colors,
  Label,
  Input,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useSaveFormsyncBenchmark from 'api/import_ideas/useSaveFormsyncBenchmark';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  padding: 32px;
  width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const JsonTextarea = styled.textarea`
  width: 100%;
  min-height: 400px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 16px;
  border: 1px solid ${colors.grey300};
  border-radius: 4px;
  background: ${colors.grey100};
  resize: vertical;
  tab-size: 2;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

interface Props {
  responseJson: string;
  pdfBase64: string;
  locale: string;
  onClose: () => void;
}

const SaveBenchmarkModal = ({
  responseJson,
  pdfBase64,
  locale,
  onClose,
}: Props) => {
  const [name, setName] = useState('');
  const [jsonText, setJsonText] = useState(() => {
    // Strip markdown code fences (```json ... ```) if present
    const cleaned = responseJson
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/, '');
    try {
      const parsed = JSON.parse(cleaned);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return cleaned;
    }
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const { mutateAsync: saveBenchmark, isLoading } = useSaveFormsyncBenchmark();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonError('Ground truth must be a JSON array');
        return;
      }
      setJsonError(null);

      await saveBenchmark({
        name: name.trim(),
        locale,
        ground_truth: parsed,
        pdf_base64: pdfBase64,
      });

      setSaved(true);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setJsonError(`Invalid JSON: ${e.message}`);
      }
    }
  };

  if (saved) {
    return (
      <Overlay onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <Title variant="h3" mb="16px">
            Benchmark Saved
          </Title>
          <Text mb="24px">
            &quot;{name}&quot; has been saved to the benchmark library.
          </Text>
          <Button bgColor={colors.primary} width="auto" onClick={onClose}>
            Close
          </Button>
        </Modal>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title variant="h3" mb="24px">
          Save as Benchmark
        </Title>
        <Text mb="16px" color="textSecondary">
          Edit the JSON below to correct any errors from the model output. This
          corrected version becomes the ground truth for accuracy evaluation.
        </Text>

        <Box mb="16px">
          <Label>Benchmark Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(val) => setName(val)}
            placeholder="e.g. Customer Satisfaction Survey"
          />
        </Box>

        <Box mb="8px">
          <Label>Ground Truth JSON (locale: {locale})</Label>
        </Box>
        <JsonTextarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setJsonError(null);
          }}
          spellCheck={false}
        />
        {jsonError && (
          <Text color="error" fontSize="s" mt="4px">
            {jsonError}
          </Text>
        )}

        <Box display="flex" gap="12px" mt="24px" justifyContent="flex-end">
          <Button
            buttonStyle="secondary-outlined"
            width="auto"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            bgColor={colors.success}
            width="auto"
            onClick={handleSave}
            processing={isLoading}
            disabled={!name.trim()}
          >
            Save Benchmark
          </Button>
        </Box>
      </Modal>
    </Overlay>
  );
};

export default SaveBenchmarkModal;
