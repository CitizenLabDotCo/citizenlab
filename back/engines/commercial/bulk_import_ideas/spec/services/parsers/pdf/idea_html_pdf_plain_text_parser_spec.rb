# frozen_string_literal: true

require 'rails_helper'
require_relative '../shared/pdf_parser_data_setup'

describe BulkImportIdeas::Parsers::Pdf::IdeaHtmlPdfPlainTextParser do
  include_context 'pdf_parser_data_setup'

  describe 'parse_text' do
    it 'parsed the raw text and returns structured fields' do
      service = described_class.new('en')
      result = service.parse_text(google_raw_text_array, pdf_template_data)
      expect(result).to eq(raw_text_parsed_idea)
    end
  end
end
