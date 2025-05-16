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
end
