# frozen_string_literal: true

require 'rails_helper'

describe Surveys::TypeformWebhookParser do
  let(:service) { described_class.new }
  let(:body) do
    {
      event_id: 'LtWXD3crgy',
      event_type: 'form_response',
      form_response: {
        form_id: 'lT4Z3j',
        token: 'a3a12ec67a1365927098a606107fac15',
        submitted_at: '2018-01-18T18:17:02Z',
        landed_at: '2018-01-18T18:07:02Z',
        calculated: {
          score: 9
        },
        definition: {
          id: 'lT4Z3j',
          title: 'Webhooks example',
          fields: [
            {
              id: 'DlXFaesGBpoF',
              title: "Thanks, {{answer_60906475}}! What's it like where you live? Tell us in a few sentences.",
              type: 'long_text',
              ref: 'readable_ref_long_text',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'SMEUb7VJz92Q',
              title: "If you're OK with our city management following up if they have further questions, please give us your email address.",
              type: 'email',
              ref: 'readable_ref_email',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'JwWggjAKtOkA',
              title: 'What is your first name?',
              type: 'short_text',
              ref: 'readable_ref_short_text',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'KoJxDM3c6x8h',
              title: 'When did you move to the place where you live?',
              type: 'date',
              ref: 'readable_ref_date',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'PNe8ZKBK8C2Q',
              title: 'Which pictures do you like? You can choose as many as you like.',
              type: 'picture_choice',
              ref: 'readable_ref_picture_choice',
              allow_multiple_selections: true,
              allow_other_choice: false
            },
            {
              id: 'Q7M2XAwY04dW',
              title: 'On a scale of 1 to 5, what rating would you give the weather in Sydney? 1 is poor weather, 5 is excellent weather',
              type: 'number',
              ref: 'readable_ref_number1',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'gFFf3xAkJKsr',
              title: 'By submitting this form, you understand and accept that we will share your answers with city management. Your answers will be anonymous will not be shared.',
              type: 'legal',
              ref: 'readable_ref_legal',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'k6TP9oLGgHjl',
              title: 'Which of these cities is your favorite?',
              type: 'multiple_choice',
              ref: 'readable_ref_multiple_choice',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'RUqkXSeXBXSd',
              title: "Do you have a favorite city we haven't listed?",
              type: 'yes_no',
              ref: 'readable_ref_yes_no',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'NRsxU591jIW9',
              title: 'How important is the weather to your opinion about a city? 1 is not important, 5 is very important.',
              type: 'opinion_scale',
              ref: 'readable_ref_opinion_scale',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'WOTdC00F8A3h',
              title: 'How would you rate the weather where you currently live? 1 is poor weather, 5 is excellent weather.',
              type: 'rating',
              ref: 'readable_ref_rating',
              allow_multiple_selections: false,
              allow_other_choice: false
            },
            {
              id: 'pn48RmPazVdM',
              title: 'On a scale of 1 to 5, what rating would you give the general quality of life in Sydney? 1 is poor, 5 is excellent',
              type: 'number',
              ref: 'readable_ref_number2',
              allow_multiple_selections: false,
              allow_other_choice: false
            }
          ]
        },
        answers: [
          {
            type: 'text',
            text: "It's cold right now! I live in an older medium-sized city with a university. Geographically, the area is hilly.",
            field: {
              id: 'DlXFaesGBpoF',
              type: 'long_text'
            }
          },
          {
            type: 'email',
            email: 'laura@example.com',
            field: {
              id: 'SMEUb7VJz92Q',
              type: 'email'
            }
          },
          {
            type: 'text',
            text: 'Laura',
            field: {
              id: 'JwWggjAKtOkA',
              type: 'short_text'
            }
          },
          {
            type: 'date',
            date: '2005-10-15',
            field: {
              id: 'KoJxDM3c6x8h',
              type: 'date'
            }
          },
          {
            type: 'choices',
            choices: {
              labels: %w[
                London
                Sydney
              ]
            },
            field: {
              id: 'PNe8ZKBK8C2Q',
              type: 'picture_choice'
            }
          },
          {
            type: 'number',
            number: 5,
            field: {
              id: 'Q7M2XAwY04dW',
              type: 'number'
            }
          },
          {
            type: 'boolean',
            boolean: true,
            field: {
              id: 'gFFf3xAkJKsr',
              type: 'legal'
            }
          },
          {
            type: 'choice',
            choice: {
              label: 'London'
            },
            field: {
              id: 'k6TP9oLGgHjl',
              type: 'multiple_choice'
            }
          },
          {
            type: 'boolean',
            boolean: false,
            field: {
              id: 'RUqkXSeXBXSd',
              type: 'yes_no'
            }
          },
          {
            type: 'number',
            number: 2,
            field: {
              id: 'NRsxU591jIW9',
              type: 'opinion_scale'
            }
          },
          {
            type: 'number',
            number: 3,
            field: {
              id: 'WOTdC00F8A3h',
              type: 'rating'
            }
          },
          {
            type: 'number',
            number: 4,
            field: {
              id: 'pn48RmPazVdM',
              type: 'number'
            }
          }
        ]
      }
    }
  end

  it 'generates the correct survey response' do
    response = service.body_to_response(body)
    expect(response).to have_attributes({
      survey_service: 'typeform',
      external_survey_id: 'lT4Z3j',
      user: nil,
      started_at: Time.parse('2018-01-18T18:07:02Z'),
      submitted_at: Time.parse('2018-01-18T18:17:02Z')
    })

    expect(response.answers).to contain_exactly({
      'question_id' => 'DlXFaesGBpoF',
      'question_text' => "Thanks, {{answer_60906475}}! What's it like where you live? Tell us in a few sentences.",
      'value' => "It's cold right now! I live in an older medium-sized city with a university. Geographically, the area is hilly."
    }, {
      'question_id' => 'SMEUb7VJz92Q',
      'question_text' => "If you're OK with our city management following up if they have further questions, please give us your email address.",
      'value' => 'laura@example.com'
    }, {
      'question_id' => 'JwWggjAKtOkA',
      'question_text' => 'What is your first name?',
      'value' => 'Laura'
    }, {
      'question_id' => 'KoJxDM3c6x8h',
      'question_text' => 'When did you move to the place where you live?',
      'value' => '2005-10-15'
    }, {
      'question_id' => 'PNe8ZKBK8C2Q',
      'question_text' => 'Which pictures do you like? You can choose as many as you like.',
      'value' => %w[
        London
        Sydney
      ]
    }, {
      'question_id' => 'Q7M2XAwY04dW',
      'question_text' => 'On a scale of 1 to 5, what rating would you give the weather in Sydney? 1 is poor weather, 5 is excellent weather',
      'value' => 5
    }, {
      'question_id' => 'gFFf3xAkJKsr',
      'question_text' => 'By submitting this form, you understand and accept that we will share your answers with city management. Your answers will be anonymous will not be shared.',
      'value' => true
    }, {
      'question_id' => 'k6TP9oLGgHjl',
      'question_text' => 'Which of these cities is your favorite?',
      'value' => 'London'
    }, {
      'question_id' => 'RUqkXSeXBXSd',
      'question_text' => "Do you have a favorite city we haven't listed?",
      'value' => false
    }, {
      'question_id' => 'NRsxU591jIW9',
      'question_text' => 'How important is the weather to your opinion about a city? 1 is not important, 5 is very important.',
      'value' => 2
    }, {
      'question_id' => 'WOTdC00F8A3h',
      'question_text' => 'How would you rate the weather where you currently live? 1 is poor weather, 5 is excellent weather.',
      'value' => 3
    }, {
      'question_id' => 'pn48RmPazVdM',
      'question_text' => 'On a scale of 1 to 5, what rating would you give the general quality of life in Sydney? 1 is poor, 5 is excellent',
      'value' => 4
    })
  end
end
