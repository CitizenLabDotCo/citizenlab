# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::GoogleFormParserService do
  # it 'gets idea rows from the PDF file' do
  #   # Comment this stub out to use the actual Google service - used for now as VCR not working
  #   # expect_any_instance_of(described_class).to receive(:parse_pdf).and_return(
  #   #   [
  #   #     [
  #   #       { name: 'Name:', value: 'John Rambo', type: '', page: 1, x: 0.09, y: 1.16 },
  #   #       { name: 'Email:', value: 'john_rambo@gravy.com', type: '', page: 1, x: 0.09, y: 1.24 },
  #   #       { name: 'Title:', value: 'Free donuts for all', type: '', page: 1, x: 0.09, y: 1.34 },
  #   #       { name: 'Body:', value: 'If we give everyone free donuts then they will all be much happier', type: '', page: 1, x: 0.09, y: 1.41 },
  #   #       { name: 'Yes:', value: nil, type: 'filled_checkbox', page: 1, x: 0.11, y: 1.66 },
  #   #       { name: 'No:', value: nil, type: 'unfilled_checkbox', page: 1, x: 0.45, y: 1.66 }
  #   #     ]
  #   #   ]
  #   # )
  #   #file_content = nil
    
  #   file_content = File.binread '/cl2_back/engines/commercial/bulk_import_ideas/spec/fixtures/slightly_better.pdf'
    
  #   service = described_class.new file_content
  #   docs = service.parse_pdf

  #   expect(docs).not_to be_nil
  #   expect(docs[0].find { |doc| doc[:name] == 'Title:' }[:value]).to eq 'Free donuts for all'
  # end

  it 'parses text correctly (single document)' do
    service = described.class.new nil

    text = "Title\n" +
      "My very good idea\n" +
      "Description\n" +
      "would suggest building the\n" +
      "new swimming Pool near the\n" +
      "Shopping mall on Park Lane,\n" +
      "It's easily accessible location\n" + 
      "with enough space\n" + 
      "an\n" +
      "Location (optional)\n" + 
      "Dear shopping mall\n" + 
      "Your favourite name for a swimming pool (optional)\n" +
      "*This answer will only be shared with moderators, and not to the public.\n" +
      "The cool pool\n" +
      "How much do you like pizza (optional)\n" +
      "*This answer will only be shared with moderators, and not to the public.\n" +
      "A lot\n" + 
      "○ Not at all\n" + 
      "How much do you like burgers (optional)\n" + 
      "*This answer will only be shared with moderators, and not to the public.\n" +
      "O A lot\n" + 
      "Not at all\n"

    docs = service.parse_text text

    
  end

  # it 'parses text correctly (multiple documents)' do
    # # TODO
  # end
end
