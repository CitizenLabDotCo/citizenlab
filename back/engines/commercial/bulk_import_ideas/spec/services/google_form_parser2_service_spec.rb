# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::GoogleFormParser2Service do
  it 'parses text correctly (single document)' do
    custom_fields = nil # TODO

    service = described.class.new(nil, custom_fields)

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
