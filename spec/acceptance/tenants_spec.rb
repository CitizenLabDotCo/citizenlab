require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Tenants" do
  before do
    @current_user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
  end

  get "api/v1/tenants/current" do
    example_request "Get the current tenant" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.with_indifferent_access.dig(:data, :attributes, :host)).to eq 'example_org'
    end
  end
end
