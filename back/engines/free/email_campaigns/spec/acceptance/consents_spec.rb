# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Campaign consents' do
  explanation 'A consent defines whether a specific user (dis)allows a specific campaign type'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:admin)
  end

  get '/web_api/v1/consents' do
    before do
      SettingsService.new.activate_feature! 'community_monitor' # Turn on optional campaigns (only community monitor for now)
      @campaigns = EmailCampaigns::DeliveryService.new.campaign_classes.select do |klaz|
        klaz.ancestors.include?(EmailCampaigns::Consentable) && klaz.consentable_for?(@user)
      end.map do |klaz|
        factory_type = :"#{klaz.name.demodulize.underscore}_campaign"
        create(factory_type)
      end

      @consents = @campaigns.map.with_index do |campaign, i|
        create(:consent, user: @user, campaign_type: campaign.type, consented: i.even?)
      end
    end

    parameter :unsubscription_token, 'A token passed through by e-mail unsubscribe links, giving unauthenticated access', required: false
    parameter :without_campaign_names, "An array of campaign names that should not be returned. Possible values are #{EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.map(&:campaign_name).join(', ')}", required: false

    context 'when authenticated' do
      before { header_token_for @user }

      example_request 'List all campaign consents' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq @consents.size
      end

      example 'Listing all campaigns creates unexisting consents', document: false do
        @consents.take(1).each(&:destroy)
        do_request
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq EmailCampaigns::DeliveryService.new.consentable_campaign_types_for(@user).size
      end

      example 'List all campaigns consents with expected management labels' do
        do_request

        json_response = json_parse(response_body)
        multiloc_service ||= MultilocService.new

        campaigns_content_type_multiloc = @campaigns.map do |campaign|
          multiloc_service.i18n_to_multiloc(campaign.class.content_type_multiloc_key).transform_keys(&:to_sym)
        end

        response_content_type_multiloc = json_response[:data].map do |consent|
          consent[:attributes][:content_type_multiloc]
        end

        expect(response_content_type_multiloc).to match_array campaigns_content_type_multiloc
      end

      context 'when using without_campaign_names' do
        let(:without_campaign_names) { [@campaigns.first.class.campaign_name] }

        example_request 'List all campaign consents without the first campaign' do
          expect(status).to eq 200
          json_response = json_parse(response_body)

          expect(json_response[:data].size).to eq @consents.size - 1
          expect(json_response[:data].pluck(:attributes).pluck(:campaign_name))
            .not_to include without_campaign_names.first
        end
      end
    end

    context 'when using an unsubscription token' do
      let(:unsubscription_token) { create(:email_campaigns_unsubscription_token, user: @user).token }

      example_request 'List all campaign consents using unsubscription token' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq @consents.size
      end
    end

    context 'with an invalid unsubscription_token' do
      let(:unsubscription_token) { 'garbage' }

      example 'List all campaigns with an invalid unsubscription token', document: false do
        do_request
        expect(status).to eq 401
      end
    end
  end

  patch 'web_api/v1/consents/:id' do
    with_options scope: :consent do
      parameter :consented, 'Boolean that indicates whether the user consents', required: true
    end
    parameter :unsubscription_token, 'A token passed through by e-mail unsubscribe links, giving unauthenticated access', required: false
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Consent)

    let(:campaign) { create(:manual_campaign) }
    let(:consent) { create(:consent, user: @user, campaign_type: campaign.type) }
    let(:id) { consent.id }
    let(:consented) { false }

    context 'when authenticated' do
      before { header_token_for @user }

      example_request 'Update a campaign consent' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :consented)).to eq consented
      end
    end

    context 'when using an unsubscription token' do
      let(:unsubscription_token) { create(:email_campaigns_unsubscription_token, user: @user).token }

      example_request 'Update a campaign consent using an unsubscription token' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :consented)).to eq consented
      end
    end
  end

  patch 'web_api/v1/consents/by_campaign_id/:campaign_id' do
    with_options scope: :consent do
      parameter :consented, 'Boolean that indicates whether the user consents', required: true
    end
    parameter :unsubscription_token, 'A token passed through by e-mail unsubscribe links, giving unauthenticated access', required: false
    ValidationErrorHelper.new.error_fields(self, EmailCampaigns::Consent)

    let(:campaign) { create(:manual_campaign) }
    let!(:consent) { create(:consent, user: @user, campaign_type: campaign.type) }
    let(:campaign_id) { campaign.id }
    let(:consented) { false }

    context 'when authenticated' do
      before { header_token_for @user }

      example_request 'Update a campaign consent by campaign id' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq consent.id
        expect(json_response.dig(:data, :attributes, :consented)).to eq consented
      end
    end

    context 'when using an unsubscription token' do
      let(:unsubscription_token) { create(:email_campaigns_unsubscription_token, user: @user).token }

      example_request 'Update a campaign consent by campaign id using an unsubscription token' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq consent.id
        expect(json_response.dig(:data, :attributes, :consented)).to eq consented
      end
    end

    context 'when using an unsubscription token and the user is not active' do
      let(:unsubscription_token) { create(:email_campaigns_unsubscription_token, user: @user).token }

      example 'Update a campaign consent by campaign id using an unsubscription token is allowed' do
        @user.update!(registration_completed_at: nil)
        do_request
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq consent.id
        expect(json_response.dig(:data, :attributes, :consented)).to eq consented
      end
    end
  end
end
