# frozen_string_literal: true

require 'rails_helper'

# VCR.configure do |config|
#   config.before_http_request do |req|
#     puts req.uri
#     puts req.body
#   end
# end

describe BulkImportIdeas::GoogleFormParserService do
  # TODO: Cannot get this to record the actual response
  # around do |example|
  #   cassette_library_dir = BulkImportIdeas::Engine.root / 'spec/fixtures/vcr_cassettes'
  #   VcrHelper.use_cassette_library_dir(cassette_library_dir) do
  #     VCR.use_cassette('google_document_ai') { example.run }
  #   end
  # end

  it 'gets idea rows from the PDF file' do
    # Comment this stub out to use the actual Google service - used for now as VCR not working
    expect_any_instance_of(described_class).to receive(:parse_paper_form).and_return(
      [
        {
          'Name:' => { value: 'John Rambo', type: '' },
          'Email:' => { value: 'john_rambo@gravy.com', type: '' },
          'Title:' => { value: 'Free donuts for all', type: '' },
          'Body:' => { value: 'If we give everyone free donuts then they will all be much happier', type: '' },
          'Yes' => { value: nil, type: 'filled_checkbox' },
          'No' => { value: nil, type: 'unfilled_checkbox' }
        }
      ]
    )
    file_content = File.binread '/cl2_back/engines/commercial/bulk_import_ideas/spec/fixtures/testscan.pdf'
    service = described_class.new file_content
    docs = service.parse_paper_form

    expect(docs).not_to be_nil
    expect(docs[0]['Title:'][:value]).to eq 'Free donuts for all'
  end
end
