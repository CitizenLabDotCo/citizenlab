import React, { useState, useEffect, useRef, useMemo } from 'react';

import {
  Box,
  Text,
  Title,
  Button,
  colors,
  Label,
  Spinner,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useEvaluateFormsyncBenchmark, {
  EvaluationResult,
} from 'api/import_ideas/useEvaluateFormsyncBenchmark';
import useFormsyncBenchmarks, {
  BenchmarkSummary,
} from 'api/import_ideas/useFormsyncBenchmarks';

import AccuracyReport from './components/AccuracyReport';
import QuestionDiff from './components/QuestionDiff';
import { MODEL_OPTIONS } from './TestTab';

const SelectInput = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.grey300};
  border-radius: 4px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const ResponseArea = styled.pre`
  background: ${colors.grey100};
  border: 1px solid ${colors.grey300};
  border-radius: 4px;
  padding: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
`;

interface Props {
  initialBenchmarkId: string | null;
  initialBenchmarkLocale: string | null;
}

const EvaluateTab = ({ initialBenchmarkId, initialBenchmarkLocale }: Props) => {
  const { data: benchmarksData, isLoading: loadingBenchmarks } =
    useFormsyncBenchmarks();
  const { mutateAsync: evaluate, isLoading: evaluating } =
    useEvaluateFormsyncBenchmark();

  const [selectedBenchmark, setSelectedBenchmark] =
    useState<BenchmarkSummary | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt_41');
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const benchmarks = useMemo(
    () => benchmarksData?.benchmarks ?? [],
    [benchmarksData]
  );

  // Auto-select benchmark from Library tab
  const initialized = useRef(false);
  useEffect(() => {
    if (
      !initialized.current &&
      initialBenchmarkId &&
      initialBenchmarkLocale &&
      benchmarks.length > 0
    ) {
      const found = benchmarks.find(
        (b) =>
          b.id === initialBenchmarkId && b.locale === initialBenchmarkLocale
      );
      if (found) {
        setSelectedBenchmark(found);
      }
      initialized.current = true;
    }
  }, [initialBenchmarkId, initialBenchmarkLocale, benchmarks]);

  const handleBenchmarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    if (!key) {
      setSelectedBenchmark(null);
      return;
    }
    const [locale, ...idParts] = key.split(':');
    const id = idParts.join(':');
    const found = benchmarks.find((b) => b.id === id && b.locale === locale);
    setSelectedBenchmark(found ?? null);
  };

  const handleEvaluate = async () => {
    if (!selectedBenchmark) return;

    try {
      const evalResult = await evaluate({
        id: selectedBenchmark.id,
        locale: selectedBenchmark.locale,
        model: selectedModel,
      });
      setResult(evalResult);
    } catch {
      // Error handled by mutation
    }
  };

  if (loadingBenchmarks) {
    return (
      <Box display="flex" justifyContent="center" p="40px">
        <Spinner />
      </Box>
    );
  }

  if (benchmarks.length === 0) {
    return (
      <Box p="40px" style={{ textAlign: 'center' }}>
        <Text color="textSecondary" fontSize="l">
          No benchmarks available.
        </Text>
        <Text color="textSecondary" mt="8px">
          Save a benchmark from the Test tab first.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" gap="16px" mb="24px">
        <Box flex="1">
          <Label>Benchmark</Label>
          <SelectInput
            value={
              selectedBenchmark
                ? `${selectedBenchmark.locale}:${selectedBenchmark.id}`
                : ''
            }
            onChange={handleBenchmarkChange}
          >
            <option value="">Select a benchmark...</option>
            {benchmarks.map((b) => (
              <option key={`${b.locale}:${b.id}`} value={`${b.locale}:${b.id}`}>
                {b.name} ({b.locale}) - {b.question_count} questions
              </option>
            ))}
          </SelectInput>
        </Box>
        <Box flex="1">
          <Label>Model</Label>
          <SelectInput
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </SelectInput>
        </Box>
      </Box>

      <Box display="flex" gap="16px" alignItems="center" mb="32px">
        <Button
          bgColor={colors.primary}
          width="auto"
          onClick={handleEvaluate}
          processing={evaluating}
          disabled={!selectedBenchmark}
        >
          {evaluating ? 'Evaluating...' : 'Run Evaluation'}
        </Button>
      </Box>

      {result && (
        <Box>
          <Title variant="h3" mb="16px">
            Results
            <Text
              as="span"
              color="textSecondary"
              fontWeight="normal"
              fontSize="base"
              ml="8px"
            >
              ({MODEL_OPTIONS.find((m) => m.value === result.model)?.label}
              {result.response_time_ms &&
                ` — ${(result.response_time_ms / 1000).toFixed(1)}s`}
              )
            </Text>
          </Title>

          {result.accuracy ? (
            <Box>
              <AccuracyReport accuracy={result.accuracy} />
              <Box mt="32px">
                <QuestionDiff questions={result.accuracy.by_question} />
              </Box>
            </Box>
          ) : (
            <Box>
              <Text color="error" mb="16px" fontWeight="bold">
                Could not parse model response as JSON. Raw response shown
                below.
              </Text>
            </Box>
          )}

          <Box mt="24px">
            <Title variant="h4" mb="8px">
              Raw Model Response
            </Title>
            <ResponseArea>{result.model_response}</ResponseArea>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EvaluateTab;
