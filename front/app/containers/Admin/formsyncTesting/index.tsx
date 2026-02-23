import React, { useState } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import Tabs from 'components/UI/Tabs';

import EvaluateTab from './EvaluateTab';
import LibraryTab from './LibraryTab';
import TestTab from './TestTab';

type TabName = 'test' | 'library' | 'evaluate';

const TAB_ITEMS = [
  { name: 'test', label: 'Import' },
  { name: 'library', label: 'Library' },
  { name: 'evaluate', label: 'Evaluate' },
];

const FormsyncTesting = () => {
  const [selectedTab, setSelectedTab] = useState<TabName>('test');
  const [evaluateBenchmarkId, setEvaluateBenchmarkId] = useState<string | null>(
    null
  );
  const [evaluateBenchmarkLocale, setEvaluateBenchmarkLocale] = useState<
    string | null
  >(null);

  const handleEvaluate = (benchmarkId: string, locale: string) => {
    setEvaluateBenchmarkId(benchmarkId);
    setEvaluateBenchmarkLocale(locale);
    setSelectedTab('evaluate');
  };

  return (
    <Box p="40px">
      <Title variant="h1" color="primary" mb="8px">
        Formsync Testing
      </Title>
      <Text mb="24px" color="textSecondary">
        Test PDF form parsing across different LLM models, save benchmarks, and
        evaluate accuracy.
      </Text>

      <Box mb="32px">
        <Tabs
          items={TAB_ITEMS}
          selectedValue={selectedTab}
          onClick={(name) => setSelectedTab(name as TabName)}
        />
      </Box>

      <Box display={selectedTab === 'test' ? 'block' : 'none'}>
        <TestTab />
      </Box>
      <Box display={selectedTab === 'library' ? 'block' : 'none'}>
        <LibraryTab onEvaluate={handleEvaluate} />
      </Box>
      <Box display={selectedTab === 'evaluate' ? 'block' : 'none'}>
        <EvaluateTab
          initialBenchmarkId={evaluateBenchmarkId}
          initialBenchmarkLocale={evaluateBenchmarkLocale}
        />
      </Box>
    </Box>
  );
};

export default FormsyncTesting;
