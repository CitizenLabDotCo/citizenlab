require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Campaign consents" do

  explanation "A consent defines whether a specific user (dis)allows a specific campaign type"

  before do
    header "Content-Type", "application/json"
    @user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
  end


  get "/web_api/v1/users/:user_id/consents" do

    before do
      @consents = EmailCampaigns::DeliveryService.new.campaign_types.map.with_index do |campaign_type, i|
        create(:consent, user: @user, campaign_type: campaign_type, consented: i%2 == 0)
      end
    end

    let(:user_id) { @user.id }

    example_request "List all campaign consents for the user" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq @consents.size
    end

    example "Listing all campaigns creates unexisting consents", document: false do
      @consents.take(3).each(&:destroy)
      do_request
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq EmailCampaigns::DeliveryService.new.campaign_types.size
    end
  end

  patch "web_api/v1/consents/:id" do
    with_options scope: :consent do
      parameter :consented, "Boolean that indicates whether the user consents", required: true
    end
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Consent)

    let(:consent) { create(:consent, user: @user) }
    let(:id) { consent.id }
    let(:consented) { false }

    example_request "Update a campaign consent" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:consented)).to eq consented
    end
  end

end