import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import SurveyBars from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Graphs/SurveyBars',
  render: (props) => (
    <Box w="100%" display="flex" justifyContent="center">
      <Box w="100%" maxWidth="600px" p="8px">
        <SurveyBars {...props} />
      </Box>
    </Box>
  ),
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof SurveyBars>;

export default meta;
type Story = StoryObj<typeof meta>;

const COLOR_SCHEME = [
  '#2F478A',
  '#4D85C6',
  '#EE7041',
  '#F3A675',
  '#67D6C5',
  '#3C8177',
  '#5FC4E8',
  '#64A0AF',
  '#875A20',
  '#A3A33A',
];

const ungroupedData: ResultUngrouped = {
  inputType: 'multiselect',
  question: {
    en: 'Question: multiselect',
  },
  customFieldId: '894c900b-fc12-4aaa-884b-e313cea89321',
  required: false,
  grouped: false,
  totalResponseCount: 4,
  questionResponseCount: 4,
  totalPickCount: 8,
  answers: [
    {
      answer: 'multiselect_option_1_s2e',
      count: 4,
    },
    {
      answer: 'multiselect_option_2_3c7',
      count: 4,
    },
    {
      answer: null,
      count: 0,
    },
  ],
  multilocs: {
    answer: {
      multiselect_option_1_s2e: {
        title_multiloc: {
          en: 'multiselect: Option 1',
        },
      },
      multiselect_option_2_3c7: {
        title_multiloc: {
          en: 'multiselect: Option 2',
        },
      },
    },
  },
};

export const Default: Story = {
  args: {
    questionResult: ungroupedData,
    colorScheme: COLOR_SCHEME,
  },
};

const groupedData: ResultGrouped = {
  inputType: 'multiselect',
  question: {
    en: 'Question: multiselect',
  },
  customFieldId: '894c900b-fc12-4aaa-884b-e313cea89321',
  required: false,
  grouped: true,
  totalResponseCount: 4,
  questionResponseCount: 4,
  totalPickCount: 8,
  answers: [
    {
      answer: 'multiselect_option_1_s2e',
      count: 4,
      groups: [
        {
          group: 'male',
          count: 2,
        },
        {
          group: 'female',
          count: 2,
        },
      ],
    },
    {
      answer: 'multiselect_option_2_3c7',
      count: 4,
      groups: [
        {
          group: 'male',
          count: 2,
        },
        {
          group: 'female',
          count: 2,
        },
      ],
    },
    {
      answer: null,
      count: 0,
      groups: [],
    },
  ],
  multilocs: {
    answer: {
      multiselect_option_1_s2e: {
        title_multiloc: {
          en: 'multiselect: Option 1',
        },
      },
      multiselect_option_2_3c7: {
        title_multiloc: {
          en: 'multiselect: Option 2',
        },
      },
    },
    group: {
      male: {
        title_multiloc: {
          en: 'Male',
        },
      },
      female: {
        title_multiloc: {
          en: 'Female',
        },
      },
      unspecified: {
        title_multiloc: {
          en: 'Other',
        },
      },
    },
  },
  legend: ['male', 'female', 'unspecified', null],
};

export const Grouped: Story = {
  args: {
    questionResult: groupedData,
    colorScheme: COLOR_SCHEME,
  },
};

const skewedData: ResultGrouped = {
  ...groupedData,
  totalResponseCount: 40,
  questionResponseCount: 40,
  totalPickCount: 80,
  answers: [
    {
      answer: 'multiselect_option_1_s2e',
      count: 78,
      groups: [
        {
          group: 'male',
          count: 76,
        },
        {
          group: 'female',
          count: 2,
        },
      ],
    },
    {
      answer: 'multiselect_option_2_3c7',
      count: 2,
      groups: [
        {
          group: 'male',
          count: 1,
        },
        {
          group: 'female',
          count: 1,
        },
      ],
    },
    {
      answer: null,
      count: 0,
      groups: [],
    },
  ],
};

export const Skewed: Story = {
  args: {
    questionResult: skewedData,
    colorScheme: COLOR_SCHEME,
  },
};
