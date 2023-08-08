# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::GoogleFormParserService do
  # let(:service) { described_class.new '/cl2_back/engines/commercial/bulk_import_ideas/spec/fixtures/example_forms.pdf' }

  it 'gets idea rows from the PDF file' do
    file_content = File.binread '/cl2_back/engines/commercial/bulk_import_ideas/spec/fixtures/testscan.pdf'
    service = described_class.new file_content
    docs = service.parse_paper_form

    pp docs
    # binding.pry

    # Usage
    # pdf_parser = DocumentAIPDFParserService.new('path_to_your_pdf.pdf')
    # form_fields = pdf_parser.parse_form_fields
    #
    # form_fields.each do |field|
    #   puts "Field Type: #{field[:type]}"
    #   puts "Field Label: #{field[:label]}"
    #   puts "Field Value: #{field[:value]}"
    #   puts "-" * 30
    # end

  end
end
