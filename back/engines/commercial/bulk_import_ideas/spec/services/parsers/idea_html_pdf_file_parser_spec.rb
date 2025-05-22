# frozen_string_literal: true

require 'rails_helper'
require_relative './shared/pdf_parser_data_setup'

describe BulkImportIdeas::Parsers::IdeaHtmlPdfFileParser do
  include_context 'pdf_parser_data_setup'

  let(:service) { described_class.new create(:admin), 'en', survey_phase.id, false }

  describe 'remove_question_numbers_in_keys' do
    before do
      allow(service).to receive(:template_data).and_return(pdf_template_data)
    end

    it 'replaces the question keys with the actual title of the question' do
      output = service.send(:remove_question_numbers_in_keys, google_parsed_form_object)
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
    let(:all_fields) { [field] }

    it 'removes text that is after the end text delimiter' do
      field[:content_delimiters][:end] = 'This is the next field title'
      processed_field_value = service.send(:process_text_field_value, field, all_fields)
      expect(processed_field_value).to eq 'Something here first. This is a description of the field. This is the text that we really want.'
    end

    it 'removes text that is before the start text delimiter' do
      field[:content_delimiters][:start] = 'This is a description of the field.'
      processed_field_value = service.send(:process_text_field_value, field, all_fields)
      expect(processed_field_value).to eq 'This is the text that we really want. This is the next field title. There is other stuff too.'
    end

    it 'removes text that is before the start text delimiter AND after the end delimiter' do
      field[:content_delimiters][:start] = 'This is a description of the field.'
      field[:content_delimiters][:end] = 'This is the next field title'
      processed_field_value = service.send(:process_text_field_value, field, all_fields)
      expect(processed_field_value).to eq 'This is the text that we really want.'
    end
  end
end
