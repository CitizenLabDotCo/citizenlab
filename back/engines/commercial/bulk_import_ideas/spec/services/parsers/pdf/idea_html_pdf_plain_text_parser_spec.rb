# frozen_string_literal: true

require 'rails_helper'
require_relative '../shared/pdf_parser_data_setup'

describe BulkImportIdeas::Parsers::Pdf::IdeaHtmlPdfPlainTextParser do
  include_context 'pdf_parser_data_setup'

  describe 'parse_text' do
    it 'parsed the raw text and returns structured fields' do
      service = described_class.new('en')
      result = service.parse_text(google_parsed_raw_text_array, pdf_template_data)

      expect(result).to eq({
        pdf_pages: [1, 2, 3, 4, 5, 6, 7],
        fields: {
          'Your question' => 'Option 1',
          'This is a short answer' => 'I really like Short answers',
          'This is a long answer' => "I'm They not so much longer Keen ол answers. Long to take Fill in",
          'Linear scale field' => 1,
          'Another linear scale - no description' => 2,
          'Multiple choice' => ['another option you might like more', 'something else'],
          "If 'something else', please specify" => 'I cannot make up my my mind 7.',
          'Image choice' => ['Choose homer', 'Choose Maggie', 'Other'],
          "If 'Other', please specify" => 'Seymour 8.',
          'Rating question' => 3,
          'Sentiment scale question' => 5,
          'Number field' => 283,
          'Gender' => 'Male',
          'Year of birth' => 1976,
          'Are you a politician?' => 'Retired politician',
          'Place of residence' => 'Oscarburgh'
        }
      })
    end
  end
end
