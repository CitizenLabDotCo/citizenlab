# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Campaigns' do
  explanation 'E-mail campaigns, both automated and manual'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:admin)
    EmailCampaigns::UnsubscriptionToken.create!(user_id: @user.id)
    header_token_for @user
  end

  get '/web_api/v1/campaigns' do
    before do
      @campaigns = create_list(:manual_campaign, 3)
      @automated_campaigns = create_list(:official_feedback_on_initiative_you_follow_campaign, 2)
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of campaigns per page'
    end
    parameter :campaign_names, "An array of campaign names that should be returned. Possible values are #{EmailCampaigns::DeliveryService.new.campaign_classes.map(&:campaign_name).join(', ')}", required: false
    parameter :without_campaign_names, "An array of campaign names that should not be returned. Possible values are #{EmailCampaigns::DeliveryService.new.campaign_classes.map(&:campaign_name).join(', ')}", required: false

    example_request 'List all campaigns' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end

    example 'List all manual campaigns' do
      do_request(campaign_names: ['manual'])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end

    example 'List all non-manual campaigns' do
      do_request(without_campaign_names: ['manual'])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end

    example 'List all non-manual campaigns with expected management labels' do
      do_request(without_campaign_names: ['manual'])
      json_response = json_parse(response_body)

      multiloc_service ||= MultilocService.new
      recipient_role_multiloc = multiloc_service.i18n_to_multiloc(@automated_campaigns[0].class.recipient_role_multiloc_key).transform_keys(&:to_sym)
      recipient_segment_multiloc = multiloc_service.i18n_to_multiloc(@automated_campaigns[0].class.recipient_segment_multiloc_key).transform_keys(&:to_sym)
      content_type_multiloc = multiloc_service.i18n_to_multiloc(@automated_campaigns[0].class.content_type_multiloc_key).transform_keys(&:to_sym)
      trigger_multiloc = multiloc_service.i18n_to_multiloc(@automated_campaigns[0].class.trigger_multiloc_key).transform_keys(&:to_sym)

      expect(json_response[:data][0][:attributes][:recipient_role_multiloc]).to eq    recipient_role_multiloc
      expect(json_response[:data][0][:attributes][:recipient_segment_multiloc]).to eq recipient_segment_multiloc
      expect(json_response[:data][0][:attributes][:content_type_multiloc]).to eq      content_type_multiloc
      expect(json_response[:data][0][:attributes][:trigger_multiloc]).to eq           trigger_multiloc
    end
  end

  get '/web_api/v1/campaigns/:id' do
    let(:campaign) { create(:manual_campaign) }
    let(:id) { campaign.id }

    example_request 'Get one campaign by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  get '/web_api/v1/campaigns/:id/preview' do
    let(:campaign) { create(:manual_campaign) }
    let(:id) { campaign.id }

    example_request 'Get a campaign HTML preview' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:html]).to be_present
    end
  end

  post 'web_api/v1/campaigns' do
    with_options scope: :campaign do
      parameter :campaign_name, "The type of campaign. One of #{EmailCampaigns::DeliveryService.new.campaign_classes.map(&:campaign_name).join(', ')}", required: true
      parameter :sender, "Who is shown as the sender towards the recipients, either #{EmailCampaigns::SenderConfigurable::SENDERS.join(' or ')}", required: true
      parameter :reply_to, 'The e-mail of the reply-to address. Defaults to the author', required: false
      parameter :subject_multiloc, 'The of the email, as a multiloc string', required: true
      parameter :body_multiloc, 'The body of the email campaign, as a multiloc string. Supports basic HTML', required: true
      parameter :group_ids, 'Array of group ids to whom the email should be sent', required: false
    end
    ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

    let(:campaign) { build(:manual_campaign) }
    let(:campaign_name) { 'manual' }
    let(:subject_multiloc) { campaign.subject_multiloc }
    let(:body_multiloc) { campaign.body_multiloc }
    let(:sender) { 'author' }
    let(:reply_to) { 'test@emailer.com' }
    let(:group_ids) { [create(:group).id] }

    example_request 'Create a campaign' do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :subject_multiloc).stringify_keys).to match subject_multiloc
      expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
      expect(json_response.dig(:data, :attributes, :sender)).to match sender
      expect(json_response.dig(:data, :attributes, :reply_to)).to match reply_to
      expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
      expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to eq group_ids
    end
  end

  patch 'web_api/v1/campaigns/:id' do
    with_options scope: :campaign do
      parameter :sender, "Who is shown as the sender towards the recipients, either #{EmailCampaigns::SenderConfigurable::SENDERS.join(' or ')}", required: true
      parameter :reply_to, 'The e-mail of the reply-to address. Defaults to the author', required: true
      parameter :subject_multiloc, 'The of the email, as a multiloc string', required: true
      parameter :body_multiloc, 'The body of the email campaign, as a multiloc string. Supports basic HTML', required: true
      parameter :group_ids, 'Array of group ids to whom the email should be sent', required: false
    end
    ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

    let(:campaign) { create(:manual_campaign) }
    let(:id) { campaign.id }
    let(:subject_multiloc) { { 'en' => 'New subject' } }
    let(:body_multiloc) { { 'en' => 'New body' } }
    let(:sender) { 'organization' }
    let(:reply_to) { 'otherguy@organization.net' }
    let(:group_ids) { [create(:group).id] }

    example_request 'Update a campaign' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :subject_multiloc).stringify_keys).to match subject_multiloc
      expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
      expect(json_response.dig(:data, :attributes, :sender)).to match sender
      expect(json_response.dig(:data, :attributes, :campaign_description_multiloc).stringify_keys).to eq campaign.class.campaign_description_multiloc
      expect(json_response.dig(:data, :attributes, :reply_to)).to match reply_to
      expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq campaign.author_id
      expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to eq group_ids
    end
  end

  delete 'web_api/v1/campaigns/:id' do
    let!(:id) { create(:manual_campaign).id }

    example 'Delete a campaign' do
      old_count = EmailCampaigns::Campaign.count
      do_request
      assert_status 200
      expect { EmailCampaigns::Campaign.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect(EmailCampaigns::Campaign.count).to eq(old_count - 1)
    end
  end

  post 'web_api/v1/campaigns/:id/send' do
    ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

    let(:campaign) { create(:manual_campaign) }
    let(:id) { campaign.id }

    example_request 'Send out the campaign now' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :attributes, :deliveries_count)).to eq User.count
    end

    example '[error] Send out the campaign without an author' do
      campaign.update_columns(author_id: nil, sender: 'author')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:author, 'blank')
    end
  end

  get 'web_api/v1/campaigns/:id/deliveries' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of deliveries per page'
    end

    let(:campaign) { create(:manual_campaign) }
    let!(:id) { campaign.id }
    let!(:deliveries) { create_list(:delivery, 5, campaign: campaign) }

    example_request 'Get the deliveries of a sent campaign. Includes the recipients.' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq deliveries.size
      expect(json_response[:included].size).to eq deliveries.size
    end
  end

  get 'web_api/v1/campaigns/:id/stats' do
    let(:campaign) { create(:manual_campaign) }
    let!(:id) { campaign.id }
    let!(:deliveries) do
      create_list(
        :delivery, 20,
        campaign: campaign,
        delivery_status: 'accepted'
      )
    end

    example_request 'Get the delivery statistics of a sent campaign' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data][:attributes]).to match({
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
