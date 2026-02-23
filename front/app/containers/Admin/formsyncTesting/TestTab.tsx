import React, { useState } from 'react';

import {
  Box,
  Text,
  Title,
  Button,
  colors,
  Label,
  Spinner,
  Input,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';
import { object, string, mixed } from 'yup';

import useFormsyncTest from 'api/import_ideas/useFormsyncTest';
import useSaveFormsyncBenchmark from 'api/import_ideas/useSaveFormsyncBenchmark';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import Feedback from 'components/HookForm/Feedback';
import Select from 'components/HookForm/Select';
import SingleFileUploader from 'components/HookForm/SingleFileUploader';

import { handleHookFormSubmissionError } from 'utils/errorUtils';

export const MODEL_OPTIONS = [
  { value: 'gpt_5', label: 'GPT-5 (Azure)' },
  { value: 'gpt_41', label: 'GPT-4.1 (Azure)' },
  { value: 'gpt_4o', label: 'GPT-4o (Azure)' },
  { value: 'gpt_4o_mini', label: 'GPT-4o Mini (Azure)' },
  { value: 'claude_opus_45', label: 'Claude Opus 4.5 (Bedrock)' },
  { value: 'claude_sonnet_45', label: 'Claude Sonnet 4.5 (Bedrock)' },
  { value: 'claude_haiku_45', label: 'Claude Haiku 4.5 (Bedrock)' },
  { value: 'gemini_3_flash', label: 'Gemini 3 Flash (Vertex)' },
  { value: 'gemini_3_pro', label: 'Gemini 3 Pro (Vertex)' },
];

const JsonTextarea = styled.textarea`
  width: 100%;
  height: 600px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 16px;
  border: 1px solid ${colors.grey300};
  border-radius: 4px;
  background: ${colors.grey100};
  resize: vertical;
  tab-size: 2;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

interface FormValues {
  locale: SupportedLocale;
  model: string;
  file: Record<string, any>;
}

const TestTab = () => {
  const locale = useLocale();
  const locales = useAppConfigurationLocales();
  const { mutateAsync: runTest, isLoading } = useFormsyncTest();
  const [response, setResponse] = useState<string | null>(null);
  const [responseModel, setResponseModel] = useState<string | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [benchmarkName, setBenchmarkName] = useState('');
  const [editableJson, setEditableJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { mutateAsync: saveBenchmark, isLoading: saving } =
    useSaveFormsyncBenchmark();

  const schema = object({
    locale: string().required('Please select a locale'),
    model: string().required('Please select a model'),
    file: mixed().required('Please upload a PDF file'),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      locale,
      model: 'claude_opus_45',
      file: undefined,
    },
    resolver: yupResolver(schema) as any,
  });

  const localeOptions =
    locales?.map((l) => ({
      value: l,
      label: l,
    })) ?? [];

  const currentLocale = methods.watch('locale');

  const handleSaveBenchmark = async () => {
    if (!benchmarkName.trim() || !pdfBase64) return;

    try {
      const parsed = JSON.parse(editableJson);
      if (!Array.isArray(parsed)) {
        setJsonError('Ground truth must be a JSON array');
        return;
      }
      setJsonError(null);

      await saveBenchmark({
        name: benchmarkName.trim(),
        locale: currentLocale,
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

  const submitTest = async ({ locale, model, file }: FormValues) => {
    try {
      setPdfBase64(file.base64);
      const result = await runTest({
        locale,
        model,
        file: file.base64,
      });

      setResponse(result.response);
      setResponseModel(result.model);
      setResponseTimeMs(result.response_time_ms);
      setSaved(false);
      setJsonError(null);

      // Strip markdown code fences and pretty-print for the editable textarea
      const cleaned = result.response
        .replace(/^```(?:json)?\s*\n?/i, '')
        .replace(/\n?```\s*$/, '');
      try {
        const parsed = JSON.parse(cleaned);
        setEditableJson(JSON.stringify(parsed, null, 2));
      } catch {
        setEditableJson(cleaned);
      }
    } catch (e) {
      handleHookFormSubmissionError(e, methods.setError);
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(submitTest)}>
          <Feedback onlyShowErrors />

          <Box display="flex" gap="16px" mb="24px">
            <Box flex="1">
              <Select name="locale" label="Locale" options={localeOptions} />
            </Box>
            <Box flex="1">
              <Select name="model" label="Model" options={MODEL_OPTIONS} />
            </Box>
          </Box>

          <Box mb="24px">
            <SingleFileUploader name="file" accept=".pdf" />
          </Box>

          <Box display="flex" gap="16px" alignItems="center">
            <Button
              bgColor={colors.primary}
              width="auto"
              type="submit"
              processing={isLoading}
            >
              Run Import
            </Button>
            {isLoading && (
              <Box display="flex" alignItems="center" gap="8px">
                <Spinner size="20px" />
                <Text color="textSecondary" fontSize="s">
                  Waiting for LLM response...
                </Text>
              </Box>
            )}
          </Box>
        </form>
      </FormProvider>

      {response !== null && (
        <Box mt="40px">
          <Title variant="h3" mb="12px">
            Response
            {responseModel && (
              <Text
                as="span"
                color="textSecondary"
                fontWeight="normal"
                fontSize="base"
                ml="8px"
              >
                ({MODEL_OPTIONS.find((m) => m.value === responseModel)?.label}
                {responseTimeMs !== null &&
                  ` — ${(responseTimeMs / 1000).toFixed(1)}s`}
                )
              </Text>
            )}
          </Title>

          <Box display="flex" gap="16px">
            {/* Editable JSON */}
            <Box flex="1" minWidth="0">
              <Label>Editable JSON (ground truth)</Label>
              <JsonTextarea
                value={editableJson}
                onChange={(e) => {
                  setEditableJson(e.target.value);
                  setJsonError(null);
                  setSaved(false);
                }}
                spellCheck={false}
              />
              {jsonError && (
                <Text color="error" fontSize="s" mt="4px">
                  {jsonError}
                </Text>
              )}
            </Box>

            {/* PDF preview */}
            {pdfBase64 && (
              <Box flex="1" minWidth="0">
                <Label>PDF Preview</Label>
                <iframe
                  src={pdfBase64}
                  style={{
                    width: '100%',
                    height: '600px',
                    border: `1px solid ${colors.grey300}`,
                    borderRadius: '4px',
                  }}
                  title="Uploaded PDF preview"
                />
              </Box>
            )}
          </Box>

          {/* Save as benchmark */}
          <Box display="flex" gap="12px" alignItems="center" mt="16px">
            <Box style={{ width: '300px' }}>
              <Input
                type="text"
                value={benchmarkName}
                onChange={(val) => setBenchmarkName(val)}
                placeholder="Benchmark name..."
              />
            </Box>
            <Button
              bgColor={colors.success}
              width="auto"
              onClick={handleSaveBenchmark}
              processing={saving}
              disabled={!benchmarkName.trim() || saved}
            >
              {saved ? 'Saved!' : 'Save as Benchmark'}
            </Button>
            {saved && (
              <Text color="success" fontSize="s">
                Benchmark &quot;{benchmarkName}&quot; saved to library.
              </Text>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default TestTab;
