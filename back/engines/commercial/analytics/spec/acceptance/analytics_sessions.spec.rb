# frozen_string_literal: true

# Tests for queries needed by the visitors dashboard

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - Sessions model' do
  explanation 'Queries to summarise session data from impact tracking module.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    # TODO: add test
  end
end
