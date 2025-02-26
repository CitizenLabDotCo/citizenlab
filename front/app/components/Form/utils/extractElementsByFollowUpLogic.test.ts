import extractElementsByFollowUpLogic from './extractElementsByFollowUpLogic';

describe('extractElementsByFollowUpLogic', () => {
  it('works', () => {
    expect(
      extractElementsByFollowUpLogic(pageElementsWithFollowUp, {
        // Parent field has NOT been answered yet
        sentiment_linear_scale_question_drs: undefined,
      })
    ).toHaveLength(1); // Only the parent field is in the page elements

    expect(
      extractElementsByFollowUpLogic(pageElementsWithFollowUp, {
        // Parent field HAS been answered
        sentiment_linear_scale_question_drs: 3,
      })
    ).toHaveLength(2); // Both parent field and follow-up field should be in the page elements

    expect(
      extractElementsByFollowUpLogic(pageElementsWithoutFollowUp, {
        // Parent field HAS been answered
        sentiment_linear_scale_question_drs: 3,
      })
    ).toHaveLength(1); // Only the parent field is in the page elements
  });
});

const pageElementsWithFollowUp = [
  {
    type: 'Control', // Parent field
    scope: '#/properties/sentiment_linear_scale_question_drs',
    label: 'How do you feel about living in Gothenburg?',
    options: {
      description: '',
      input_type: 'sentiment_linear_scale',
      isAdminField: false,
      hasRule: false,
      ask_follow_up: true,
      linear_scale_label1: 'Very bad',
      linear_scale_label2: 'Bad',
      linear_scale_label3: 'Ok',
      linear_scale_label4: 'Good',
      linear_scale_label5: 'Very good',
    },
  },
  {
    type: 'Control', // Follow-up field
    scope: '#/properties/sentiment_linear_scale_question_drs_follow_up',
    label: 'Tell us why',
    options: {
      description: '',
      input_type: 'multiline_text',
      isAdminField: false,
      hasRule: false,
      textarea: true,
      transform: 'trim_on_blur',
    },
  },
];

const pageElementsWithoutFollowUp = [
  {
    type: 'Control', // Parent field
    scope: '#/properties/sentiment_linear_scale_question_drs',
    label: 'How do you feel about living in Gothenburg?',
    options: {
      description: '',
      input_type: 'sentiment_linear_scale',
      isAdminField: false,
      hasRule: false,
      ask_follow_up: false,
      linear_scale_label1: 'Very bad',
      linear_scale_label2: 'Bad',
      linear_scale_label3: 'Ok',
      linear_scale_label4: 'Good',
      linear_scale_label5: 'Very good',
    },
  },
];
