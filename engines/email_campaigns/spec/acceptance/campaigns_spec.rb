require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Campaigns" do

  explanation "E-mail campaigns, both automated and manual"

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    EmailCampaigns::UnsubscriptionToken.create!(user_id: @user.id)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end


  get "/web_api/v1/campaigns" do

    before do
      @campaigns = create_list(:manual_campaign, 3)
      create_list(:official_feedback_on_voted_initiative_campaign, 2)
    end

    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of campaigns per page"
    end
    parameter :campaign_names, "An array of campaign names that should be returned. Possible values are #{EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.map(&:campaign_name).join(', ')}", required: false
    parameter :without_campaign_names, "An array of campaign names that should not be returned. Possible values are #{EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.map(&:campaign_name).join(', ')}", required: false


    example_request "List all campaigns" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end

    example "List all manual campaigns" do
      do_request(campaign_names: ["manual"])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end

    example "List all non-manual campaigns" do
      do_request(without_campaign_names: ["manual"])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "/web_api/v1/campaigns/:id" do
    let(:campaign) { create(:manual_campaign) }
    let(:id) {campaign.id}

    example_request "Get one campaign by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  get "/web_api/v1/campaigns/:id/preview" do
    let(:campaign) { create(:manual_campaign) }
    let(:id) { campaign.id }

    example_request "Get a campaign HTML preview" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:html]).to be_present
    end
  end

  post "web_api/v1/campaigns" do
    with_options scope: :campaign do
      parameter :campaign_name, "The type of campaign. One of #{EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.map(&:campaign_name).join(', ')}", required: true
      parameter :sender, "Who is shown as the sender towards the recipients, either #{EmailCampaigns::SenderConfigurable::SENDERS.join(' or ')}", required: true
      parameter :reply_to, "The e-mail of the reply-to address. Defaults to the author", required: false
      parameter :subject_multiloc, "The of the email, as a multiloc string, maximal #{EmailCampaigns::ContentConfigurable::MAX_SUBJECT_LEN}", required: true
      parameter :body_multiloc, "The body of the email campaign, as a multiloc string. Supports basic HTML", required: true
      parameter :group_ids, "Array of group ids to whom the email should be sent", required: false
    end
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Campaign)
    let(:campaign) { build(:manual_campaign) }
    let(:campaign_name) { "manual" }
    let(:subject_multiloc) { campaign.subject_multiloc }
    let(:body_multiloc) { campaign.body_multiloc }
    let(:sender) { 'author' }
    let(:reply_to) { 'test@emailer.com' }
    let(:group_ids) { [create(:group).id] }

    example_request "Create a campaign" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:subject_multiloc).stringify_keys).to match subject_multiloc
      expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
      expect(json_response.dig(:data,:attributes,:sender)).to match sender
      expect(json_response.dig(:data,:attributes,:reply_to)).to match reply_to
      expect(json_response.dig(:data,:relationships,:author,:data,:id)).to eq @user.id
      expect(json_response.dig(:data,:relationships,:groups,:data).map{|d| d[:id]}).to eq group_ids
    end
  end

  patch "web_api/v1/campaigns/:id" do
    with_options scope: :campaign do
      parameter :sender, "Who is shown as the sender towards the recipients, either #{EmailCampaigns::SenderConfigurable::SENDERS.join(' or ')}", required: true
      parameter :reply_to, "The e-mail of the reply-to address. Defaults to the author", required: true
      parameter :subject_multiloc, "The of the email, as a multiloc string, maximal #{EmailCampaigns::ContentConfigurable::MAX_SUBJECT_LEN}", required: true
      parameter :body_multiloc, "The body of the email campaign, as a multiloc string. Supports basic HTML", required: true
      parameter :group_ids, "Array of group ids to whom the email should be sent", required: false
    end
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Campaign)

    let(:campaign) { create(:manual_campaign) }
    let(:id) { campaign.id }
    let(:subject_multiloc) { {"en" => "New subject"}}
    let(:body_multiloc) { {"en" => "New body"} }
    let(:sender) { 'organization' }
    let(:reply_to) { 'otherguy@organization.net' }
    let(:group_ids) { [create(:group).id] }

    example_request "Update a campaign" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:subject_multiloc).stringify_keys).to match subject_multiloc
      expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
      expect(json_response.dig(:data,:attributes,:sender)).to match sender
      expect(json_response.dig(:data,:attributes,:admin_campaign_description_multiloc).stringify_keys).to eq campaign.class.admin_campaign_description_multiloc
      expect(json_response.dig(:data,:attributes,:reply_to)).to match reply_to
      expect(json_response.dig(:data,:relationships,:author,:data,:id)).to eq campaign.author_id
      expect(json_response.dig(:data,:relationships,:groups,:data).map{|d| d[:id]}).to eq group_ids
    end
  end

  delete "web_api/v1/campaigns/:id" do
    let!(:id) { create(:manual_campaign).id }

    example "Delete a campaign" do
      old_count = EmailCampaigns::Campaign.count
      do_request
      expect(response_status).to eq 200
      expect{EmailCampaigns::Campaign.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      expect(EmailCampaigns::Campaign.count).to eq (old_count - 1)
    end
  end

  post "web_api/v1/campaigns/:id/send" do
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Campaign)

    let(:campaign) { create(:manual_campaign)}
    let(:id) { campaign.id }

    example_request "Send out the campaign now" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:deliveries_count)).to eq User.count
    end

    example "[error] Send out the campaign without an author" do
      campaign.update_columns(author_id: nil, sender: 'author')
      do_request
      expect(response_status).to eq 422
      json_response = json_parse(response_body)
      expect(json_response[:errors][:author][0][:error]).to eq 'blank'
    end
  end

  get "web_api/v1/campaigns/:id/deliveries" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of deliveries per page"
    end

    let(:campaign) { create(:manual_campaign) }
    let!(:id) { campaign.id}
    let!(:deliveries) { create_list(:delivery, 5, campaign: campaign)}

    example_request "Get the deliveries of a sent campaign. Includes the recipients." do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq deliveries.size
      expect(json_response[:included].size).to eq deliveries.size
    end
  end

  get "web_api/v1/campaigns/:id/stats" do
    let(:campaign) { create(:manual_campaign) }
    let!(:id) { campaign.id}
    let!(:deliveries) { create_list(:delivery, 20,
      campaign: campaign,
      delivery_status: 'accepted'
    )}

    example_request "Get the delivery statistics of a sent campaing" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        sent: 20,
        bounced: 0,
        failed: 0,
        accepted: 20,
        delivered: 0,
        opened: 0,
        clicked: 0,
        total: 20
      })
    end
  end

end
