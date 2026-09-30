# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaCustomFields::SurveyGenerator do
  subject(:generator) { described_class.new(phase, 'en') }

  let(:phase) { create(:native_survey_phase) }
  let(:llm) { instance_double(Analysis::LLM::ClaudeSonnet46) }

  let(:llm_response) do
    {
      'pages' => [
        {
          'title' => 'Your park',
          'description' => 'Tell us how you use the park.',
          'questions' => [
            question('select', 'How often do you visit?', options: %w[Daily Weekly]),
            question('linear_scale', 'How safe do you feel?', scale_maximum: 3, scale_labels: ['Unsafe', '', 'Safe'])
          ]
        }
      ]
    }
  end

  def question(input_type, title, options: [], statements: [], scale_maximum: 0, scale_labels: [])
    {
      'input_type' => input_type,
      'title' => title,
      'description' => '',
      'required' => false,
      'options' => options,
      'statements' => statements,
      'scale_maximum' => scale_maximum,
      'scale_labels' => scale_labels
    }
  end

  before do
    allow(Analysis::LLM::ClaudeSonnet46).to receive(:new).and_return(llm)
    allow(llm).to receive(:chat).and_return(llm_response)
  end

  describe '#generate' do
    it 'maps the LLM response to replace_form_fields fields, ending with the form end page' do
      fields = generator.generate(prompt: 'A survey about the park')

      expect(fields[0]).to eq(
        input_type: 'page',
        page_layout: 'default',
        title_multiloc: { 'en' => 'Your park' },
        description_multiloc: { 'en' => '<p>Tell us how you use the park.</p>' }
      )
      expect(fields[1]).to eq(
        input_type: 'select',
        title_multiloc: { 'en' => 'How often do you visit?' },
        description_multiloc: {},
        required: false,
        options: [{ title_multiloc: { 'en' => 'Daily' } }, { title_multiloc: { 'en' => 'Weekly' } }]
      )
      expect(fields[2]).to eq(
        input_type: 'linear_scale',
        title_multiloc: { 'en' => 'How safe do you feel?' },
        description_multiloc: {},
        required: false,
        maximum: 3,
        linear_scale_label_1_multiloc: { 'en' => 'Unsafe' },
        linear_scale_label_2_multiloc: {},
        linear_scale_label_3_multiloc: { 'en' => 'Safe' }
      )
      expect(fields[3]).to include(input_type: 'page', key: 'form_end', include_in_printed_form: false)
      expect(fields.size).to eq(4)
    end

    it 'returns fields that are valid input for the replace_form_fields tool' do
      fields = generator.generate(prompt: 'A survey about the park')
      tool = McpServer::Tools::ReplaceFormFields.for(current_user: nil, token_scopes: [])

      expect { tool.input_schema.validate_arguments(container_type: 'phase', container_id: phase.id, fields: fields) }
        .not_to raise_error
    end

    it 'sends the prompt with the structured output schema' do
      generator.generate(prompt: 'A survey about the park')

      expect(llm).to have_received(:chat) do |message, response_schema:|
        expect(message.inputs).to contain_exactly(a_string_including('A survey about the park'))
        expect(response_schema).to eq(described_class::RESPONSE_SCHEMA)
      end
    end

    it 'attaches PDF files and inlines Markdown files', :active_job_que_adapter do
      pdf = create(:file, name: 'minimal_pdf.pdf', ai_processing_allowed: true)
      markdown = create(:file, name: 'survey_brief.md', ai_processing_allowed: true)

      generator.generate(prompt: nil, files: [pdf, markdown])

      expect(llm).to have_received(:chat) do |message, **|
        text, *attachments = message.inputs
        expect(text).to include('<source_document>', 'The city plans to redesign the central park.')
        expect(attachments).to eq([pdf])
      end
    end

    it 'refuses files that are not allowed to be processed by AI' do
      file = create(:file, ai_processing_allowed: false)

      expect { generator.generate(prompt: nil, files: [file]) }.to raise_error(ArgumentError)
      expect(llm).not_to have_received(:chat)
    end

    it 'drops unusable questions and pages' do
      llm_response['pages'] += [
        {
          'title' => 'Empty page',
          'description' => '',
          'questions' => [
            question('select', 'Only one option', options: ['Yes']),
            question('matrix_linear_scale', 'No statements', scale_maximum: 5),
            question('file_upload', 'Unsupported type'),
            question('text', '  ')
          ]
        }
      ]

      fields = generator.generate(prompt: 'A survey about the park')

      expect(fields.pluck(:title_multiloc)).not_to include({ 'en' => 'Empty page' })
      expect(fields.size).to eq(4)
    end

    it 'fixes the scale of sentiment and out-of-range scales, and gives ratings no labels' do
      llm_response['pages'][0]['questions'] = [
        question('sentiment_linear_scale', 'Mood', scale_maximum: 7, scale_labels: %w[1 2 3 4 5 6 7]),
        question('linear_scale', 'Too long', scale_maximum: 20),
        question('rating', 'Stars', scale_maximum: 5, scale_labels: %w[a b c d e])
      ]

      sentiment, linear_scale, rating = generator.generate(prompt: 'A survey')[1..3]

      expect(sentiment).to include(maximum: 5, linear_scale_label_5_multiloc: { 'en' => '5' })
      expect(sentiment).not_to have_key(:linear_scale_label_6_multiloc)
      expect(linear_scale).to include(maximum: 11)
      expect(rating).to include(maximum: 5)
      expect(rating).not_to have_key(:linear_scale_label_1_multiloc)
    end

    it 'reuses the persisted form end page' do
      form = create(:custom_form, participation_context: phase)
      create(:custom_field_page, resource: form)
      end_page = create(
        :custom_field_form_end_page,
        resource: form,
        title_multiloc: { 'en' => 'Thanks a lot!' }
      )

      fields = generator.generate(prompt: 'A survey about the park')

      expect(fields.last).to include(id: end_page.id, key: 'form_end', title_multiloc: { 'en' => 'Thanks a lot!' })
    end

    it 'raises when the LLM response is not a JSON object' do
      allow(llm).to receive(:chat).and_return('Sorry, I cannot help with that.')

      expect { generator.generate(prompt: 'A survey') }.to raise_error(described_class::InvalidOutputError)
    end

    it 'raises when no usable question remains' do
      llm_response['pages'][0]['questions'] = [question('select', 'Only one option', options: ['Yes'])]

      expect { generator.generate(prompt: 'A survey') }.to raise_error(described_class::InvalidOutputError)
    end
  end
end
