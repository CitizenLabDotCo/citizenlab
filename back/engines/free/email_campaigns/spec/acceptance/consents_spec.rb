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
      @campaigns = EmailCampaigns::DeliveryService.new.campaign_classes.select do |klaz|
        klaz.ancestors.include?(EmailCampaigns::Consentable) && klaz.consentable_for?(@user)
      end.map do |klaz|
        factory_type = "#{klaz.name.demodulize.underscore}_campaign".to_sym
        create(factory_type)
      end

      @consents = @campaigns.map.with_index do |campaign, i|
        create(:consent, user: @user, campaign_type: campaign.type, consented: i.even?)
      end
    end

    parameter :unsubscription_token, 'A token passed through by e-mail unsubscribe links, giving unauthenticated access', required: false

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

      example_request 'List all campaigns consents with expected categories' do
        categories = %w[own admin official mention voted commented scheduled]
        json_response = json_parse(response_body)
        expect(json_response[:data]).to all(satisfy { |consent| categories.include?(consent[:attributes][:category]) })
      end

      example 'List all campaigns consents with expected management labels' do
        do_request

        json_response = json_parse(response_body)
        multiloc_service ||= MultilocService.new

        campaigns_mgmt_attrs = @campaigns.map do |campaign|
          [
            [:recipient_role_multiloc, multiloc_service.i18n_to_multiloc(campaign.class.recipient_role_multiloc_key).transform_keys(&:to_sym)],
            [:content_type_multiloc, multiloc_service.i18n_to_multiloc(campaign.class.content_type_multiloc_key).transform_keys(&:to_sym)]
          ].to_h
        end

        response_mgmt_attrs = json_response[:data].map do |consent|
          [
            [:recipient_role_multiloc, consent[:attributes][:recipient_role_multiloc]],
            [:content_type_multiloc, consent[:attributes][:content_type_multiloc]]
          ].to_h
        end

        expect(response_mgmt_attrs).to eq campaigns_mgmt_attrs
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
  end
end
