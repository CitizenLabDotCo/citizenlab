import React, { useState, useEffect, useRef } from 'react';

import {
  Box,
  Text,
  Title,
  Button,
  colors,
  Label,
  Spinner,
  Radio,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';
import { object, string, mixed } from 'yup';

import useFormsyncTest from 'api/import_ideas/useFormsyncTest';
import usePhases from 'api/phases/usePhases';
import useProjects from 'api/projects/useProjects';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import Feedback from 'components/HookForm/Feedback';
import Select from 'components/HookForm/Select';
import SingleFileUploader from 'components/HookForm/SingleFileUploader';

import { handleHookFormSubmissionError } from 'utils/errorUtils';

const MODEL_OPTIONS = [
  { value: 'gpt_41', label: 'GPT-4.1 (Azure)' },
  { value: 'gpt_4o', label: 'GPT-4o (Azure)' },
  { value: 'gpt_4o_mini', label: 'GPT-4o Mini (Azure)' },
  { value: 'claude_opus_45', label: 'Claude Opus 4.5 (Bedrock)' },
  { value: 'claude_sonnet_45', label: 'Claude Sonnet 4.5 (Bedrock)' },
  { value: 'claude_haiku_45', label: 'Claude Haiku 4.5 (Bedrock)' },
  { value: 'gemini_3_flash', label: 'Gemini 3 Flash (Vertex)' },
  { value: 'gemini_3_pro', label: 'Gemini 3 Pro (Vertex)' },
];

type Mode = 'blind' | 'guided';

const ResponseArea = styled.pre`
  background: ${colors.grey100};
  border: 1px solid ${colors.grey300};
  border-radius: 4px;
  padding: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 600px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
`;

interface FormValues {
  project_id?: string;
  phase_id?: string;
  locale: SupportedLocale;
  model: string;
  file: Record<string, any>;
}

const FormsyncTesting = () => {
  const locale = useLocale();
  const localize = useLocalize();
  const locales = useAppConfigurationLocales();
  const { mutateAsync: runTest, isLoading } = useFormsyncTest();
  const [response, setResponse] = useState<string | null>(null);
  const [responseModel, setResponseModel] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('blind');

  const schema = object({
    project_id:
      mode === 'guided'
        ? string().required('Please select a project')
        : string().optional(),
    phase_id:
      mode === 'guided'
        ? string().required('Please select a phase')
        : string().optional(),
    locale: string().required('Please select a locale'),
    model: string().required('Please select a model'),
    file: mixed().required('Please upload a PDF file'),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      project_id: undefined,
      phase_id: undefined,
      locale,
      model: 'gpt_41',
      file: undefined,
    },
    resolver: yupResolver(schema) as any,
  });

  const selectedProjectId = methods.watch('project_id');
  const prevProjectId = useRef(selectedProjectId);

  useEffect(() => {
    if (prevProjectId.current !== selectedProjectId) {
      methods.setValue('phase_id', '' as any);
      prevProjectId.current = selectedProjectId;
    }
  }, [selectedProjectId, methods]);

  const { data: projectsData } = useProjects({
    publicationStatuses: ['published', 'draft', 'archived'],
    canModerate: true,
  });

  const { data: phasesData } = usePhases(selectedProjectId);

  const projectOptions =
    projectsData?.data.map((p) => ({
      value: p.id,
      label: localize(p.attributes.title_multiloc),
    })) ?? [];

  const phaseOptions =
    phasesData?.data.map((p) => ({
      value: p.id,
      label: localize(p.attributes.title_multiloc),
    })) ?? [];

  const localeOptions =
    locales?.map((l) => ({
      value: l,
      label: l,
    })) ?? [];

  const submitTest = async ({ phase_id, locale, model, file }: FormValues) => {
    try {
      setPdfBase64(file.base64);
      const result = await runTest({
        phase_id: mode === 'guided' ? phase_id : undefined,
        locale,
        model,
        file: file.base64,
      });

      setResponse(result.response);
      setResponseModel(result.model);
    } catch (e) {
      handleHookFormSubmissionError(e, methods.setError);
    }
  };

  return (
    <Box p="40px">
      <Title variant="h1" color="primary" mb="8px">
        Formsync Testing
      </Title>
      <Text mb="32px" color="textSecondary">
        Test PDF form parsing across different LLM models. Upload a scanned PDF,
        choose a model, and see the raw extraction response.
      </Text>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(submitTest)}>
          <Feedback onlyShowErrors />

          <Box mb="24px">
            <Label>Mode</Label>
            <Box display="flex" gap="24px" mt="8px">
              <Radio
                onChange={() => setMode('blind')}
                currentValue={mode}
                value="blind"
                name="mode"
                id="mode-blind"
                label="Blind (no phase — generic extraction)"
              />
              <Radio
                onChange={() => setMode('guided')}
                currentValue={mode}
                value="guided"
                name="mode"
                id="mode-guided"
                label="Phase-guided (uses phase form schema)"
              />
            </Box>
          </Box>

          {mode === 'guided' && (
            <Box display="flex" gap="16px" mb="24px">
              <Box flex="1">
                <Select
                  name="project_id"
                  label="Project"
                  options={projectOptions}
                />
              </Box>
              <Box flex="1">
                <Select
                  name="phase_id"
                  label="Phase"
                  options={phaseOptions}
                  disabled={!selectedProjectId}
                />
              </Box>
            </Box>
          )}

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
              Run Test
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
                ({MODEL_OPTIONS.find((m) => m.value === responseModel)?.label})
              </Text>
            )}
          </Title>
          <Box display="flex" gap="16px">
            <Box flex="1" minWidth="0">
              <ResponseArea>{response}</ResponseArea>
            </Box>
            {pdfBase64 && (
              <Box flex="1" minWidth="0">
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
        </Box>
      )}
    </Box>
  );
};

export default FormsyncTesting;
