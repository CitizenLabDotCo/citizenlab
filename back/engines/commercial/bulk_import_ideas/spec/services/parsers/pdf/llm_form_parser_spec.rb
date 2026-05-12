# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkImportIdeas::Parsers::Pdf::LLMFormParser do
  subject(:parser) { described_class.new(phase, 'en') }

  let(:phase) { create(:native_survey_phase, with_permissions: true) }

  describe '#parse_idea' do
    let(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:page_field) { create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'First page' }) }
    let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'postcode', title_multiloc: { 'en' => 'Please tell us your postcode' }) }
    let!(:multiline_field) { create(:custom_field_multiline_text, resource: custom_form, key: 'what_you_love', title_multiloc: { 'en' => 'What do you love about the neighbourhood?' }) }

    it 'returns the correct form data with key-based fields' do
      allow_any_instance_of(described_class)
        .to receive(:parse)
        .and_return({
          'question_1' => 'SE17 1AA',
          'question_2' => 'THE PLACE IS GOOD FOR TENANTS'
        })

      result = parser.parse_idea('none/needed/as/it/is/mocked', 2)

      expect(result).to eq(
        {
          pdf_pages: [1, 2],
          fields: {
            'postcode' => 'SE17 1AA',
            'what_you_love' => 'THE PLACE IS GOOD FOR TENANTS'
          }
        }
      )
    end

    it 'filters out _NOT_FOUND_ answers' do
      allow_any_instance_of(described_class)
        .to receive(:parse)
        .and_return({
          'question_1' => 'SE17 1AA',
          'question_2' => '_NOT_FOUND_'
        })

      result = parser.parse_idea('none/needed/as/it/is/mocked', 1)

      expect(result[:fields]).to eq({ 'postcode' => 'SE17 1AA' })
    end

    it 'handles nil parse response gracefully' do
      allow_any_instance_of(described_class)
        .to receive(:parse)
        .and_return(nil)

      result = parser.parse_idea('none/needed/as/it/is/mocked', 1)

      expect(result).to eq({ pdf_pages: [1], fields: {} })
    end
  end

  describe 'structured output fallback' do
    let(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:page_field) { create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'First page' }) }
    let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'postcode', title_multiloc: { 'en' => 'Postcode' }) }

    let(:llm_selector) { instance_double(LLMSelector) }
    let(:llm_instance) { instance_double(Analysis::LLM::ClaudeSonnet46) }
    let(:json_response) { '{"question_1": "SE17 1AA"}' }

    before do
      allow(LLMSelector).to receive(:new).and_return(llm_selector)
      allow(llm_selector).to receive(:llm_class_for_use_case).and_return(Analysis::LLM::ClaudeSonnet46)
      allow(Analysis::LLM::ClaudeSonnet46).to receive(:new).and_return(llm_instance)
    end

    it 'retries without response_schema when grammar too large error occurs' do
      call_count = 0
      allow(llm_instance).to receive(:chat) do |_message, **kwargs|
        call_count += 1
        if kwargs[:response_schema]
          raise RubyLLM::BadRequestError.new(nil, 'The compiled grammar is too large')
        end

        json_response
      end

      result = parser.parse_idea('mock_uploader', 1)

      expect(call_count).to eq(2)
      expect(result[:fields]).to eq({ 'postcode' => 'SE17 1AA' })
    end

    it 're-raises non-grammar BadRequestError' do
      allow(llm_instance).to receive(:chat)
        .and_raise(RubyLLM::BadRequestError.new(nil, 'invalid request'))

      expect { parser.parse_idea('mock_uploader', 1) }.to raise_error(RubyLLM::BadRequestError, 'invalid request')
    end
  end
end
