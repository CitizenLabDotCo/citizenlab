# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::GoogleFormParserService do
  it 'gets idea rows from the PDF file' do
    # Comment out this stub to use the actual Google service
    # expect_any_instance_of(described_class).to receive(:raw_text).and_return(
    #   "Page1\nTitle\nMy very good idea\nDescription\nThis is the description"
    # )
    # file_content = nil
    file_content = File.binread '/cl2_back/engines/commercial/bulk_import_ideas/spec/fixtures/page_numbers_2.pdf'
    service = described_class.new file_content
    docs = service.raw_text

    expect(docs).not_to be_nil
  end
end
