# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ActionDescriptors' do
  explanation 'Describe which actions the current user is allowed to take.'

  let(:json_response) { json_parse(response_body) }

  before do
    user_header_token
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/action_descriptors/initiatives' do
    example_request 'Get the global action descriptors for initiatives' do
      expect(response_status).to eq 200
      expect(json_response.values.pluck(:enabled).all?).to be true
      expect(json_response.values.pluck(:disabled_reason).none?).to be true
    end
  end
end
