# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Parsers::IdeaHtmlPdfFileParser do
  let(:phase) { create(:native_survey_phase) }
  let(:service) { described_class.new create(:admin), 'en', phase.id, false }

  describe 'process_text_field_value' do
    let(:field) do
      {
        value: 'Something here first. This is a description of the field. This is the text that we really want. This is the next field title. There is other stuff too.',
        content_delimiters: {
          start: nil,
          end: nil
        }
      }
    end

    it 'removes text that is after the end text delimiter' do
      field[:content_delimiters][:end] = 'This is the next field title'
      processed_field_value = service.send(:process_text_field_value, field, nil)
      expect(processed_field_value).to eq 'Something here first. This is a description of the field. This is the text that we really want.'
    end

    it 'removes text that is before the start text delimiter' do
      field[:content_delimiters][:start] = 'This is a description of the field.'
      processed_field_value = service.send(:process_text_field_value, field, nil)
      expect(processed_field_value).to eq 'This is the text that we really want. This is the next field title. There is other stuff too.'
    end

    it 'removes text that is before the start text delimiter AND after the end delimiter' do
      field[:content_delimiters][:start] = 'This is a description of the field.'
      field[:content_delimiters][:end] = 'This is the next field title'
      processed_field_value = service.send(:process_text_field_value, field, nil)
      expect(processed_field_value).to eq 'This is the text that we really want.'
    end
  end

  describe 'remove_question_numbers_in_keys' do
    let(:google_forms_data) do
      { pdf_pages: [1, 2, 3, 4, 6, 7],
        fields: { 'First name(s) (optional)' => 'James',
                  'Last name (optional)' => 'Smith',
                  'Email address (optional)' => 'James @monkey.org',
                  '1. Your question (optional)' => '& Option 1 ○ Option 2',
                  '2. This is a short answer (optional)' => 'I really like Short answers',
                  '3. This is a long answer (optional)' => 'Instructions',
                  '• Put whatever you want here' => "Keen ол answers. I'm They not so much longer Long to take Fill in",
                  'Please write a number between 1 and 5 only' => '4. Linear scale field (optional) With a description.... 1',
                  '5. Another linear scale- no description (optional) Please write a number between 1 (Totally worst) and 7 (Absolute best) only' => '1',
                  'this one_3.3.12' => 'unfilled_checkbox',
                  'another option you might like more_3.3.14' => 'filled_checkbox',
                  'something else_3.3.16' => 'filled_checkbox',
                  "If 'something else', please specify" => 'I cannot make up my my mind',
                  'Choose Marge_3.3.46' => 'unfilled_checkbox',
                  'Choose bart_3.3.46' => 'unfilled_checkbox',
                  'Choose homer_3.3.46' => 'filled_checkbox',
                  'All the Simpsons_3.3.62' => 'unfilled_checkbox',
                  'Choose Lisa_3.3.62' => 'unfilled_checkbox',
                  'Choose Maggie_3.3.62' => 'filled_checkbox',
                  'Other_3.3.78' => 'filled_checkbox',
                  "If 'Other', please specify" => 'Seymour',
                  'Rate this by writing a number between 1 (worst) and 5 (best).' => '9. Rating question (optional) 3',
                  '10. Sentiment scale question (optional)' => 'Please write a number between 1 and 5. 1 = Very bad, 3 = Ok, 5 = Very good. 5',
                  '13. Number field (optional)' => '283',
                  'Schaerbeek--' => 'Schaarbeek',
                  'Ixelles--' => 'Elsene',
                  '18. Year of birth (optional)' => '1976',
                  'Active politician_6.7.34' => 'unfilled_checkbox',
                  'Retired politician_6.7.36' => 'filled_checkbox' } }
    end

    let(:template_data) do
      { page_count: 7,
        fields: [{ name: 'Your question',
                   type: 'field',
                   description: nil,
                   print_title: '1. Your question (optional)',
                   print_format: :single_select,
                   content_delimiters: { start: 'Option 2', end: '2. This is a short answer (optional)' },
                   key: 'your_question_6l0',
                   code: nil,
                   page: 2,
                   position: 10,
                   options: [{ title: 'Option 1', key: 'option_1_m9p' }, { title: 'Option 2', key: 'option_2_fpd' }] },
          { name: 'This is a short answer',
            type: 'field',
            description: nil,
            print_title: '2. This is a short answer (optional)',
            print_format: :single_line_text,
            content_delimiters: { start: '2. This is a short answer (optional)', end: '3. This is a long answer (optional)' },
            key: 'this_is_a_short_answer_o7i',
            code: nil,
            page: 2,
            position: 21,
            options: [] },
          { name: 'This is a long answer',
            type: 'field',
            description: 'InstructionsPut whatever you want here',
            print_title: '3. This is a long answer (optional)',
            print_format: :multi_line_text,
            content_delimiters: { start: 'Put whatever you want here', end: 'This is another page title' },
            key: 'this_is_a_long_answer_j4k',
            code: nil,
            page: 2,
            position: 29,
            options: [] },
          { name: 'Linear scale field',
            type: 'field',
            description: 'With a description....',
            print_title: '4. Linear scale field (optional)',
            print_format: :single_line_text,
            content_delimiters: { start: 'Please write a number between 1 and 5 only', end: '5. Another linear scale - no description (optional)' },
            key: 'linear_scale_field_fq5',
            code: nil,
            page: 2,
            position: 74,
            options: [] },
          { name: 'Another linear scale - no description',
            type: 'field',
            description: nil,
            print_title: '5. Another linear scale - no description (optional)',
            print_format: :single_line_text,
            content_delimiters: { start: 'i        i   (          )', end: '6. Multiple choice (optional)' },
            key: 'another_linear_scale_jul',
            code: nil,
            page: 2,
            position: 88,
            options: [] },
          { name: 'Multiple choice',
            type: 'field',
            description: nil,
            print_title: '6. Multiple choice (optional)',
            print_format: :multi_select,
            content_delimiters: { start: 'i          i   (         )', end: "If 'something else', please specify" },
            key: 'multiple_choice_fyh',
            code: nil,
            page: 3,
            position: 2,
            options: [{ title: 'this one', key: 'this_one_t3a' }, { title: 'another option you might like more', key: 'another_option_you_might_like_more_na7' }, { title: 'something else', key: 'other' }] },
          { name: 'Image choice',
            type: 'field',
            description: nil,
            print_title: '7. Image choice (optional)',
            print_format: :multi_select_image,
            content_delimiters: { start: 'i          i   (         )', end: "If 'Other', please specify" },
            key: 'image_choice_9z2',
            code: nil,
            page: 3,
            position: 26,
            options: [{ title: 'Choose  Marge', key: 'this_is_an_image_7e5' },
              { title: 'Choose bart', key: 'choose_bart_wjv' },
              { title: 'Choose homer', key: 'choose_homer_yuq' },
              { title: 'Choose Lisa', key: 'choose_lisa_jzm' },
              { title: 'Choose Maggie', key: 'choose_maggie_tdf' },
              { title: 'All the Simpsons', key: 'all_the_simpsons_smv' },
              { title: 'Other', key: 'other' }] },
          { name: 'Rating question',
            type: 'field',
            description: nil,
            print_title: '9. Rating question (optional)',
            print_format: :single_line_text,
            content_delimiters: { start: 'Rate this by writing a number between 1 (worst) and 5 (best).', end: '10. Sentiment scale question (optional)' },
            key: 'rating_q_s7h',
            code: nil,
            page: 4,
            position: 22,
            options: [] },
          { name: 'Sentiment scale question',
            type: 'field',
            description: nil,
            print_title: '10. Sentiment scale question (optional)',
            print_format: :single_line_text,
            content_delimiters: { start: '1 = Very bad, 3 = Ok, 5 = Very good.', end: '11. Matrix question (optional)' },
            key: 'sentiment_scale_question_puz',
            code: nil,
            page: 4,
            position: 33,
            options: [] },
          { name: 'Number field',
            type: 'field',
            description: nil,
            print_title: '13. Number field (optional)',
            print_format: :single_line_text,
            content_delimiters: { start: 'i', end: 'Mapping page (optional)' },
            key: 'number_field_eon',
            code: nil,
            page: 4,
            position: 83,
            options: [] },
          { name: 'Gender',
            type: 'field',
            description: nil,
            print_title: '17. Gender (optional)',
            print_format: :single_select,
            content_delimiters: { start: 'Other', end: '18. Year of birth (optional)' },
            key: 'u_gender',
            code: nil,
            page: 7,
            position: 6,
            options: [{ title: 'Male', key: 'male' }, { title: 'Female', key: 'female' }, { title: 'Other', key: 'unspecified' }] },
          { name: 'Year of birth',
            type: 'field',
            description: nil,
            print_title: '18. Year of birth (optional)',
            print_format: :single_line_text,
            content_delimiters: { start: '18. Year of birth (optional)', end: '19. Are you a politician? (optional)' },
            key: 'u_birthyear',
            code: nil,
            page: 7,
            position: 19,
            options: [] },
          { name: 'Are you a politician?',
            type: 'field',
            description: 'We use this to provide you with customized information',
            print_title: '19. Are you a politician? (optional)',
            print_format: :single_select,
            content_delimiters: { start: 'We will use your answers to make wise decisions.', end: '20. Place of residence (optional)' },
            key: 'u_politician',
            code: nil,
            page: 7,
            position: 27,
            options: [{ title: 'Active politician', key: 'active_politician' }, { title: 'Retired politician', key: 'retired_politician' }, { title: 'No', key: 'no' }] }] }
    end

    before do
      allow(service).to receive(:template_data).and_return(template_data)
    end

    it 'replaces the question keys with the actual title of the question' do
      output = service.send(:remove_question_numbers_in_keys, google_forms_data)
      expect(output[:fields].keys).to eq ['First name(s) (optional)',
        'Last name (optional)',
        'Email address (optional)',
        'Your question',
        'This is a short answer',
        'This is a long answer',
        '• Put whatever you want here',
        'Please write a number between 1 and 5 only',
        '5. Another linear scale- no description (optional) Please write a number between 1 (Totally worst) and 7 (Absolute best) only',
        'this one_3.3.12',
        'another option you might like more_3.3.14',
        'something else_3.3.16',
        "If 'something else', please specify",
        'Choose Marge_3.3.46',
        'Choose bart_3.3.46',
        'Choose homer_3.3.46',
        'All the Simpsons_3.3.62',
        'Choose Lisa_3.3.62',
        'Choose Maggie_3.3.62',
        'Other_3.3.78',
        "If 'Other', please specify",
        'Rate this by writing a number between 1 (worst) and 5 (best).',
        'Sentiment scale question',
        'Number field',
        'Schaerbeek--',
        'Ixelles--',
        'Year of birth',
        'Active politician_6.7.34',
        'Retired politician_6.7.36']
    end
  end
end
