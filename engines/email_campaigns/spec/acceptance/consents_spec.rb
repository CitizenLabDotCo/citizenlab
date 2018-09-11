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
      @campaigns = [
        create(:comment_on_your_comment_campaign),
        create(:comment_on_your_idea_campaign),
        # create(:comment_deleted_by_admin_campaign),
        create(:mention_in_comment_campaign),
        # create(:status_change_of_your_idea_campaign),
        # create(:idea_published_campaign),
        create(:user_digest_campaign),
        create(:manual_campaign),
      ]
      @consents = @campaigns.map.with_index do |campaign, i|
        create(:consent, user: @user, campaign_type: campaign.type, consented: i%2 == 0)
      end
    end

    let(:user_id) { @user.id }

    example_request "List all campaign consents for the user" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq @consents.size
    end

    example "Listing all campaigns creates unexisting consents", document: false do
      @consents.take(1).each(&:destroy)
      do_request
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq EmailCampaigns::DeliveryService.new.consentable_campaign_types_for(@user).size
    end
  end

  patch "web_api/v1/consents/:id" do
    with_options scope: :consent do
      parameter :consented, "Boolean that indicates whether the user consents", required: true
    end
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Consent)

    let(:campaign) { create(:manual_campaign) }
    let(:consent) { create(:consent, user: @user, campaign_type: campaign.type) }
    let(:id) { consent.id }
    let(:consented) { false }

    example_request "Update a campaign consent" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:consented)).to eq consented
    end
  end

end