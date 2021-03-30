# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Mailgun Events' do
  explanation 'Endpoint that receives webhook events from Mailgun'

  before do
    header 'Content-Type', 'application/json'
  end

  post 'hooks/mailgun_events' do
    let(:delivery) { create(:delivery) }
    let(:signature) { '19317083e86d1be8e76337d3c92fd637279386a6a8cbfe3a8826915570599a9d' }
    let(:campaign_id) { delivery.campaign_id }
    let(:user_id) { delivery.user_id }

    let(:cl_tenant_id) { AppConfiguration.instance.id } if CitizenLab.ee?
    let(:mailgun_event) do
      {
        signature: {
          'timestamp' => '1532087464',
          'token' => '19810be4e053736bc87ea4e047a722a1d50731d4df429b1baf',
          'signature' => signature
        },
        'event-data': {
          event: 'opened',
          'user-variables': {
            cl_campaign_id: campaign_id,
            cl_user_id: user_id
          }
        }
      }.tap do |event|
        event[:'event-data'][:'user-variables'][:cl_tenant_id] = cl_tenant_id if CitizenLab.ee?
      end
    end

    example 'Receive a mailgun event webhook' do
      do_request(mailgun_event)
      expect(response_status).to eq 200
      expect(delivery.reload.delivery_status).to eq 'opened'
    end

    context '[error] for a non-existing tenant', skip: !CitizenLab.ee? do
      let!(:cl_tenant_id) { '70abacb2-69e8-4c2d-93cc-c0aeab657f02' }

      example 'returns not_acceptable' do
        do_request(mailgun_event)
        expect(response_status).to eq 406
      end
    end

    context '[error] for a non-existing campaign' do
      let!(:campaign_id) { 'ab71f907-d1ab-45b0-996f-9bf596b861b5' }

      example 'returns not_acceptable' do
        do_request(mailgun_event)
        expect(response_status).to eq 406
      end
    end

    context '[error] for a non-existing recipient' do
      let!(:user_id) { 'a0ce2303-47d5-4337-9746-89eadb32c406' }

      example 'returns not_acceptable' do
        do_request(mailgun_event)
        expect(response_status).to eq 406
      end
    end

    context '[error] for a non-matching signature' do
      before do
        allow(ENV).to receive(:fetch).with('MAILGUN_API_KEY', any_args).and_return('somefakekey')
      end

      let!(:signature) { 'Ryqqw2p75aFnseL8kjPRgu' }

      example 'returns not_acceptable' do
        do_request(mailgun_event)
        expect(response_status).to eq 406
      end
    end
  end
end
