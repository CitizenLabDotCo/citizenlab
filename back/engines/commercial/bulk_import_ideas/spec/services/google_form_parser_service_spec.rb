# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::GoogleFormParserService do
  let(:service) { described_class.new '../fixtures/example_forms.pdf' }

  it 'gets data from the PDF file' do
    form_fields = service.parse_form_fields

    binding.pry

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
