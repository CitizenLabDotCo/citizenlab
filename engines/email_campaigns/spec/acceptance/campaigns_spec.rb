require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Campaigns" do

  explanation "E-mail campaigns, manually sent out by admins and moderators"

  before do
    header "Content-Type", "application/json"
    @campaigns = create_list(:campaign, 5)
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
  end


  get "/web_api/v1/campaigns" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of campaigns per page"
    end

    example_request "List all campaigns" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq @campaigns.size
    end
  end

  get "/web_api/v1/campaigns/:id" do
    let(:id) {@campaigns.first.id}

    example_request "Get one campaign by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @campaigns.first.id
    end
  end

  get "/web_api/v1/campaigns/:id/preview" do
    let(:id) {@campaigns.first.id}

    example_request "Get a campaign HTML preview" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:html]).to be_present 
    end
  end

  post "web_api/v1/campaigns" do
    with_options scope: :campaign do
      parameter :sender, "Who is shown as the sender towards the recipients, either #{EmailCampaigns::Campaign::SENDERS.join(' or ')}", required: true
      parameter :reply_to, "Who is shown as the reply-to receiver, either #{EmailCampaigns::Campaign::REPLY_TOS.join(' or ')}", required: true
      parameter :subject_multiloc, "The of the email, as a multiloc string, maximal #{EmailCampaigns::Campaign::MAX_SUBJECT_LEN}", required: true
      parameter :body_multiloc, "The body of the email campaign, as a multiloc string. Supports basic HTML", required: true
      parameter :group_ids, "Array of group ids to whom the email should be sent", required: false
    end
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Campaign)
    let(:campaign) { build(:campaign) }
    let(:subject_multiloc) { campaign.subject_multiloc }
    let(:body_multiloc) { campaign.body_multiloc }
    let(:sender) { 'author' }
    let(:reply_to) { 'author' }
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
      parameter :sender, "Who is shown as the sender towards the recipients, either #{EmailCampaigns::Campaign::SENDERS.join(' or ')}", required: true
      parameter :reply_to, "Who is shown as the reply-to receiver, either #{EmailCampaigns::Campaign::REPLY_TOS.join(' or ')}", required: true
      parameter :subject_multiloc, "The of the email, as a multiloc string, maximal #{EmailCampaigns::Campaign::MAX_SUBJECT_LEN}", required: true
      parameter :body_multiloc, "The body of the email campaign, as a multiloc string. Supports basic HTML", required: true
      parameter :group_ids, "Array of group ids to whom the email should be sent", required: false
    end
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Campaign)

    let(:campaign) { create(:campaign) }
    let(:id) { campaign.id }
    let(:subject_multiloc) { {"en" => "New subject"}}
    let(:body_multiloc) { {"en" => "New body"} }
    let(:sender) { 'organization' }
    let(:reply_to) { 'organization' }
    let(:group_ids) { [create(:group).id] }

    example_request "Update a campaign" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:subject_multiloc).stringify_keys).to match subject_multiloc
      expect(json_response.dig(:data,:attributes,:body_multiloc).stringify_keys).to match body_multiloc
      expect(json_response.dig(:data,:attributes,:sender)).to match sender
      expect(json_response.dig(:data,:attributes,:reply_to)).to match reply_to
      expect(json_response.dig(:data,:relationships,:author,:data,:id)).to eq campaign.author_id
      expect(json_response.dig(:data,:relationships,:groups,:data).map{|d| d[:id]}).to eq group_ids
    end
  end

  delete "web_api/v1/campaigns/:id" do
    let!(:id) { create(:campaign).id }

    example "Delete a campaign" do
      old_count = EmailCampaigns::Campaign.count
      do_request
      expect(response_status).to eq 200
      expect{EmailCampaigns::Campaign.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      expect(EmailCampaigns::Campaign.count).to eq (old_count - 1)
    end
  end

  get "web_api/v1/campaigns/:id/recipients" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of recipients per page"
    end

    let(:campaign) { create(:campaign) }
    let!(:id) { campaign.id}
    let!(:recipients) { create_list(:campaigns_recipient, 5, campaign: campaign)}

    example_request "Get the recipients of a sent campaign" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq recipients.size
      expect(json_response[:included].size).to eq recipients.size
    end
  end

  get "web_api/v1/campaigns/:id/stats" do
    let(:campaign) { create(:campaign) }
    let!(:id) { campaign.id}
    let!(:recipients) { create_list(:campaigns_recipient, 20, 
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