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
        create(:comment_on_your_initiative_campaign),
        create(:idea_assigned_to_you),
        create(:idea_published_campaign),
        create(:initiative_assigned_to_you),
        create(:initiative_published_campaign),
        create(:mention_in_comment_campaign),
        create(:mention_in_official_feedback_campaign),
        create(:manual_campaign),
        create(:new_comment_for_admin),
        create(:new_idea_for_admin),
        create(:new_initiative_for_admin),
        create(:official_feedback_on_commented_idea),
        create(:official_feedback_on_commented_initiative),
        create(:official_feedback_on_voted_idea),
        create(:official_feedback_on_voted_initiative),
        create(:official_feedback_on_your_idea),
        create(:official_feedback_on_your_initiative),
        create(:project_phase_started),
        create(:project_phase_upcoming),
        create(:status_change_of_your_idea_campaign),
        create(:user_digest_campaign),
        create(:your_proposed_initiatives_digest_campaign)
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