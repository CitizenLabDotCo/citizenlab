# frozen_string_literal: true

require 'rails_helper'
require_relative 'shared/pdf_parser_data_setup'

describe BulkImportIdeas::Parsers::IdeaPdfFileLLMParser do
  let(:phase) { create(:native_survey_phase) }
  let(:custom_form) { create(:custom_form, participation_context: phase) }
  let(:service) { described_class.new(nil, 'en', phase.id, false) }

  describe '#extract_matrix_value' do
    let!(:matrix_field) do
      create(
        :custom_field_matrix_linear_scale,
        resource: custom_form,
        key: 'matrix_field',
        maximum: 5
      )
    end

    it 'reformats the matrix value from the raw LLM parsed field' do
      raw_field = {
        key: 'matrix_field',
        value: {
          'We should send more animals into space' => 3,
          'We should ride our bicycles more often' => 4
        }
      }

      expected_output = {
        'send_more_animals_to_space' => 3,
        'ride_bicycles_more_often' => 4
      }

      result = service.extract_matrix_value(raw_field)
      expect(result).to eq(expected_output)
    end
  end

  describe '#parse_rows' do
    let!(:page_field) { create(:custom_field_page, resource: custom_form) }

    let!(:multiselect_field) do
      field = create(
        :custom_field_multiselect,
        resource: custom_form,
        key: 'multiselect_field',
        title_multiloc: { 'en' => 'What is the place you like best?' },
        description_multiloc: { 'en' => 'Please give us a real indicator of what you think.' }
      )
      field.options.create!(key: 'option1', title_multiloc: { 'en' => 'Being at home with my family' })
      field.options.create!(key: 'option2', title_multiloc: { 'en' => 'Holiday in the sun' })
      field.options.create!(key: 'option3', title_multiloc: { 'en' => 'In space, floating around and eating through a straw' })
      field.options.create!(key: 'option_other', title_multiloc: { 'en' => 'Somewhere else' }, other: true)
      field
    end

    let!(:text_field) do
      create(
        :custom_field_text,
        key: 'text_field',
        resource: custom_form,
        required: true,
        title_multiloc: { 'en' => 'What is your postcode?' }
      )
    end

    let!(:multiline_field) do
      create(
        :custom_field_multiline_text,
        key: 'multiline_field',
        resource: custom_form,
        title_multiloc: { 'en' => 'Tell us what you think we should be adding to the town centre' },
        description_multiloc: { 'en' => 'Be really descriptive. There is no wrong answer.' }
      )
    end

    let!(:linear_scale_field) do
      create(
        :custom_field_linear_scale,
        resource: custom_form,
        key: 'linear_scale_field',
        title_multiloc: { 'en' => 'How would you rate the public toilets in town?' },
        linear_scale_label_1_multiloc: { 'en' => 'Terrible' },
        linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
        linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
        linear_scale_label_4_multiloc: { 'en' => 'Agree' },
        linear_scale_label_5_multiloc: { 'en' => 'Amazing' },
        maximum: 5
      )
    end

    let!(:matrix_field) do
      field = create(
        :custom_field_matrix_linear_scale,
        resource: custom_form,
        key: 'matrix_field',
        title_multiloc: { 'en' => 'Tell us how much you agree or disagree with the following statements' },
        description_multiloc: { 'en' => 'Please be honest, it helps us to plan for next year' },
        linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
        linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
        linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
        linear_scale_label_4_multiloc: { 'en' => 'Agree' },
        linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
        maximum: 5
      )
      field.matrix_statements = []
      field.matrix_statements.create!(key: 'matrix1', title_multiloc: { 'en' => 'The town will be better next year' })
      field.matrix_statements.create!(key: 'matrix2', title_multiloc: { 'en' => 'The council are doing a good job' })
      field.matrix_statements.create!(key: 'matrix3', title_multiloc: { 'en' => 'I like living in the town' })
      field
    end

    let!(:ranking_field) do
      field = create(
        :custom_field_ranking,
        key: 'ranking_field',
        resource: custom_form,
        title_multiloc: { 'en' => 'Rank the following options from your least favourite to your most favourite' }
      )
      field.options.create!(key: 'ranking1', title_multiloc: { 'en' => 'Ice cream' })
      field.options.create!(key: 'ranking2', title_multiloc: { 'en' => 'Sprouts' })
      field.options.create!(key: 'ranking3', title_multiloc: { 'en' => 'Chicken tikka' })
      field.options.create!(key: 'ranking4', title_multiloc: { 'en' => 'Cake' })
      field
    end

    # Mock template data to avoid external dependencies on Gotenberg service
    # NOTE: This template data will not be required when we move to using only the LLM parsing
    before do
      allow(service).to receive(:template_data).and_return(
        { page_count: 2,
          fields:
             [{ name: 'What is the place you like best?',
                type: 'field',
                key: 'multiselect_field',
                page: 1,
                position: 27,
                code: nil,
                input_type: 'multiselect',
                description: 'Please give us a real indicator of what you think.',
                print_title: '1. What is the place you like best? (optional)',
                content_delimiters: { start: '1. What is the place you like best? (optional)', end: "If 'Somewhere else', please specify" } },
               { name: 'Being at home with my family', type: 'option', key: 'option1', page: 1, position: 34, parent_key: 'multiselect_field' },
               { name: 'Holiday in the sun', type: 'option', key: 'option2', page: 1, position: 36, parent_key: 'multiselect_field' },
               { name: 'In space, floating around and eating through a straw', type: 'option', key: 'option3', page: 1, position: 39, parent_key: 'multiselect_field' },
               { name: 'Somewhere else', type: 'option', key: 'option_other', page: 1, position: 41, parent_key: 'multiselect_field' },
               { name: "If 'Somewhere else', please specify",
                 type: 'field',
                 key: 'multiselect_field_other',
                 page: 1,
                 position: 45,
                 code: nil,
                 input_type: 'text',
                 description: nil,
                 print_title: "If 'Somewhere else', please specify",
                 content_delimiters: { start: "If 'Somewhere else', please specify", end: '2. What is your postcode?' } },
               { name: 'What is your postcode?',
                 type: 'field',
                 key: 'text_field',
                 page: 1,
                 position: 55,
                 code: nil,
                 input_type: 'text',
                 description: 'Which councils are you attending in our city?',
                 print_title: '2. What is your postcode?',
                 content_delimiters: { start: 'Which councils are you attending in our city?', end: '3. Tell us what you think we should be adding to the town centre (optional)' } },
               { name: 'Tell us what you think we should be adding to the town centre',
                 type: 'field',
                 key: 'multiline_field',
                 page: 1,
                 position: 64,
                 code: nil,
                 input_type: 'multiline_text',
                 description: 'Be really descriptive. There is no wrong answer.',
                 print_title: '3. Tell us what you think we should be adding to the town centre (optional)',
                 content_delimiters: { start: 'Be really descriptive. There is no wrong answer.', end: '4. How would you rate the public toilets in town?' } },
               { name: 'How would you rate the public toilets in town?',
                 type: 'field',
                 key: 'linear_scale_field',
                 page: 2,
                 position: 1,
                 code: nil,
                 input_type: 'linear_scale',
                 description: 'Please indicate how strong you agree or disagree.',
                 print_title: '4. How would you rate the public toilets in town? (optional)',
                 content_delimiters: { start: 'Please write a number between 1 (Terrible) and 5 (Amazing) only', end: '5. Tell us how much you agree or disagree with the following statements (optional)' } },
               { name: 'Tell us how much you agree or disagree with the following statements',
                 type: 'field',
                 key: 'matrix_field',
                 page: 2,
                 position: 13,
                 code: nil,
                 input_type: 'matrix_linear_scale',
                 description: 'Please be honest, it helps us to plan for next year',
                 print_title: '5. Tell us how much you agree or disagree with the following statements (optional)',
                 content_delimiters: { start: 'I like living in the town', end: '6. Rank the following options from your least favourite to your most favourite (optional)' } },
               { name: 'Rank the following options from your least favourite to your most favourite',
                 type: 'field',
                 key: 'ranking_field',
                 page: 2,
                 position: 42,
                 code: nil,
                 input_type: 'ranking',
                 description: 'Which councils are you attending in our city?',
                 print_title: '6. Rank the following options from your least favourite to your most favourite (optional)',
                 content_delimiters: { start: '6. Rank the following options from your least favourite to your most favourite (optional)', end: nil } },
               { name: 'Ice cream', type: 'option', key: 'ranking1', page: 2, position: 51, parent_key: 'ranking_field' },
               { name: 'Sprouts', type: 'option', key: 'ranking2', page: 2, position: 55, parent_key: 'ranking_field' },
               { name: 'Chicken tikka', type: 'option', key: 'ranking3', page: 2, position: 58, parent_key: 'ranking_field' },
               { name: 'Cake', type: 'option', key: 'ranking4', page: 2, position: 63, parent_key: 'ranking_field' }] }
      )
    end

    it 'converts the LLM parser output into an idea' do
      # NOTE: Enable the following lines locally to test the actual LLM parsing - sample_survey.pdf matches the form created above
      # file = Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/sample_survey.pdf')
      # parser = BulkImportIdeas::Parsers::Pdf::LLMFormParser.new(phase, 'en')
      # puts "SENDING FILE TO LLM FOR PARSING: #{file}"
      # raw_result = parser.send(:parse, file)
      # parse_idea_result = parser.send(:parse_idea, file, 3)

      parse_idea_result = {
        pdf_pages: [1, 2, 3],
        fields: {
          'First name(s)' => 'Phil',
          'Last name' => 'Normal',
          'Email address' => 'phil.normal@somewhere.com',
          "By checking this box I consent to my data being used to create an account on Liege's participation platform." => 'checked',
          'What is the place you like best?' => ['Holiday in the sun', 'Somewhere else'],
          "If 'Somewhere else', please specify" => 'Rotherham',
          'What is your postcode?' => 'S11 7PF',
          'Tell us what you think we should be adding to the town centre' => 'Nothing. It is perfect. Although a McDonalds would be good',
          'How would you rate the public toilets in town?' => 3,
          'Tell us how much you agree or disagree with the following statements' => { 'The town will be better next year' => 1, 'The council are doing a good job' => 3, 'I like living in the town' => 5 },
          'Rank the following options from your least favourite to your most favourite' => ['Ice cream', 'Cake', 'Chicken tikka', 'Sprouts']
        }
      }

      expect_any_instance_of(BulkImportIdeas::Parsers::Pdf::LLMFormParser).to receive(:parse_idea).and_return(parse_idea_result)

      # Test the conversion to idea_rows
      import_file = create(:idea_import_file)
      idea_rows = service.parse_rows(import_file)

      row = idea_rows.first
      expect(row[:user_consent]).to be true
      expect(row[:user_email]).to eq 'phil.normal@somewhere.com'
      expect(row[:user_first_name]).to eq 'Phil'
      expect(row[:user_last_name]).to eq 'Normal'
      expect(row[:custom_field_values]).to eq(
        {
          multiselect_field: %w[option2 option_other],
          multiselect_field_other: 'Rotherham',
          text_field: 'S11 7PF',
          multiline_field: 'Nothing. It is perfect. Although a McDonalds would be good',
          linear_scale_field: 3,
          matrix_field: { 'matrix1' => 1, 'matrix2' => 3, 'matrix3' => 5 },
          ranking_field: %w[ranking1 ranking4 ranking3 ranking2]
        }
      )

      # Test the rows can be imported
      import_service = BulkImportIdeas::Importers::IdeaImporter.new(create(:user), 'en')
      ideas = import_service.import(idea_rows)

      idea = ideas.first
      expect(idea.custom_field_values).to eq(
        {
          'multiselect_field' => %w[option2 option_other],
          'multiselect_field_other' => 'Rotherham',
          'text_field' => 'S11 7PF',
          'multiline_field' => 'Nothing. It is perfect. Although a McDonalds would be good',
          'linear_scale_field' => 3,
          'matrix_field' => { 'matrix1' => 1, 'matrix2' => 3, 'matrix3' => 5 },
          'ranking_field' => %w[ranking1 ranking4 ranking3 ranking2]
        }
      )
      expect(idea.author.first_name).to eq 'Phil'
      expect(idea.author.last_name).to eq 'Normal'
      expect(idea.author.email).to eq 'phil.normal@somewhere.com'
    end
  end
end
