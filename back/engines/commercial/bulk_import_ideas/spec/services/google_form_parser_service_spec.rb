# frozen_string_literal: true

require 'rails_helper'

# NOTE: These tests are for development purposes due to their reliance on a Google API that cannot be easily mocked

describe BulkImportIdeas::GoogleFormParserService do
  describe 'raw_text_by_page' do
    it 'gets array of page text from the PDF file' do
      # Comment out this stub to use the actual Google service
      # expect_any_instance_of(described_class).to receive(:raw_text_page_array).and_return(
      #   ["Page1\nTitle\nMy very good idea\nDescription\nThis is the description"]
      # )
      file_content = nil
      # file_content = Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/testscan.pdf').binread
      service = described_class.new file_content
      pages = service.raw_text_page_array

      expect(pages).not_to be_nil
      expect(pages).to be_an_instance_of(Array)
      expect(pages[0]).to be_an_instance_of(String)
    end
  end
end
