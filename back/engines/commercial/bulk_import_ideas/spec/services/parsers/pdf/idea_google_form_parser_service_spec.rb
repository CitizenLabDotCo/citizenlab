# frozen_string_literal: true

require 'rails_helper'

# NOTE: These tests are for development purposes due to their reliance on a Google API that cannot be easily mocked

describe BulkImportIdeas::Parsers::Pdf::IdeaGoogleFormParserService do
  describe 'raw_text_by_page' do
    it 'gets array of page text from the PDF file' do
      # Comment out the following stub to use the actual Google service
      expect_any_instance_of(described_class).to receive(:raw_text_page_array).and_return(
        ["Page1\nTitle\nMy very good idea\nDescription\nThis is the description"]
      )

      file_content = Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_1.pdf').binread
      service = described_class.new
      pages = service.raw_text_page_array file_content

      expect(pages).not_to be_nil
      expect(pages).to be_an_instance_of(Array)
      expect(pages[0]).to be_an_instance_of(String)
    end

    # it 'parses the pdf using the form parser' do
    #   file_content = Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/formsync_survey_linearscale3.pdf').binread
    #   service = described_class.new
    #   pages = service.parse_pdf file_content, 2
    #
    #   binding.pry
    #   expect(pages).not_to be_nil
    # end
  end
end
