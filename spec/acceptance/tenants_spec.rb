require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Tenants" do
  before do
    @current_user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
  end

  get "api/v1/tenants/current" do
    it "returns current tenant info" do
      do_request
      expect(response_status).to eq 200
      expect(json_response.with_indifferent_access.dig(:data, :attributes, :host)).to eq 'example_org'
    end
  end
end
