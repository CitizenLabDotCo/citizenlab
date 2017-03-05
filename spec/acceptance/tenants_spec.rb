require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Tenants" do
  get "api/v1/tenants/current" do
    example_request "Get the current tenant" do
      expect(response_status).to be 200
      expect(JSON.parse(response_body).with_indifferent_access.dig(:data, :attributes, :host)).to eq 'example_org'
    end
  end
end
