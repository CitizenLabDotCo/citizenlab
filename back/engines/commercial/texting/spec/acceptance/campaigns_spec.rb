# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Texting campaigns' do
  before do
    header 'Content-Type', 'application/json'
    admin_header_token

    config = AppConfiguration.instance
    config.settings['texting'] = {
      allowed: true, enabled: true, from_number: '+12345678912', monthly_sms_segments_limit: 100
    }
    config.save!
  end

  get '/web_api/v1/texting_campaigns' do
    before do
      create_list(:texting_campaign, 2)
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of texting campaigns per page'
    end

    example_request 'List all texting campaigns' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get '/web_api/v1/texting_campaigns/:id' do
    let(:campaign) { create(:texting_campaign) }
    let(:id) { campaign.id }

    example_request 'Get one campaign by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  post 'web_api/v1/texting_campaigns' do
    with_options scope: :campaign do
      parameter :phone_numbers, 'Phone numbers the campaign is sent to', required: true
      parameter :message, 'The body of the texting campaign. Plain text', required: true
    end

    let(:phone_numbers) { ['+12345678911', '+12345678922'] }
    let(:message) { 'Join our platform!' }

    example_request 'Create a campaign' do
      assert_status 201
      expect(json_response_body.dig(:data, :attributes, :phone_numbers)).to match_array(phone_numbers)
      expect(json_response_body.dig(:data, :attributes, :message)).to eq(message)

      campaign = Texting::Campaign.last
      expect(campaign.phone_numbers).to match_array(phone_numbers)
      expect(campaign.message).to eq(message)
    end

    context 'when a phone number is invalid' do
      let(:phone_numbers) { ['+123'] }

      example_request '[error] Does not create a campaign with invalid phone number' do
        assert_status 422

        expect(json_response_body.dig(:errors, :phone_numbers).first).to include(
          :min_length, :max_length, :valid_country_codes, invalid_numbers: phone_numbers, error: 'invalid'
        )
        campaign = Texting::Campaign.last
        expect(campaign).to be_nil
      end
    end
  end

  patch 'web_api/v1/texting_campaigns/:id' do
    with_options scope: :campaign do
      parameter :phone_numbers, 'Phone numbers the campaign is sent to', required: true
      parameter :message, 'The body of the texting campaign. Plain text', required: true
    end

    let(:campaign) do
      create(:texting_campaign, phone_numbers: ['+12345678912'], message: 'Hello')
    end

    let(:id) { campaign.id }
    let(:phone_numbers) { ['+12345678911', ' +12345678922'] }
    let(:message) { 'Join our platform!' }

    example_request 'Update a campaign' do
      expect(response_status).to eq 200
      formatted_phone_numbers = ['+12345678911', '+12345678922']
      expect(json_response_body.dig(:data, :attributes, :phone_numbers)).to match_array(formatted_phone_numbers)
      expect(json_response_body.dig(:data, :attributes, :message)).to eq(message)

      expect(campaign.reload.phone_numbers).to match_array(formatted_phone_numbers)
      expect(campaign.message).to eq(message)
    end
  end

  post 'web_api/v1/texting_campaigns/:id/send', active_job_inline_adapter: true do
    let(:campaign) do
      create(:texting_campaign, phone_numbers: ['+12345678911'], message: 'Hello')
    end

    let(:id) { campaign.id }

    example 'Send a campaign' do
      twilio_client = Twilio::REST::Client.new
      expect(Twilio::REST::Client).to receive(:new).once.and_return(twilio_client)
      twilio_options = hash_including(body: campaign.message, to: campaign.phone_numbers.first)
      expect(twilio_client.messages).to receive(:create).once.with(twilio_options)
      expect(LogActivityJob).to receive(:perform_later)

      do_request
      expect(response_status).to eq 200
      expect(campaign.reload.status).to eq('sending')
    end

    example '[error] Send when there are too many segments in queue' do
      numbers = Array.new(Texting::Sms.provider.class::SEGMENTS_QUEUE + 1) { |i| "+123456#{10_000 + i}" }
      campaign.update!(phone_numbers: numbers)

      do_request
      assert_status 422
      expect(campaign.reload.status).to eq('draft')
    end

    example '[error] Send when monthly limit reached for this platform' do
      campaign.update!(message: '1' * 161)
      config = AppConfiguration.instance
      config.settings['texting']['monthly_sms_segments_limit'] = 1
      config.save!

      do_request
      assert_status 422
      expect(campaign.reload.status).to eq('draft')
    end
  end

  # To test locally without stubs:
  # 1. ngrok http 4000
  # 2.
  #    Tenant.find_by(host: 'localhost').tap(&:switch!)
  #    c = AppConfiguration.instance
  #    c.settings['texting']['from_number'] = '+1 844 513 0718' # or other number from https://console.twilio.com/us1/develop/phone-numbers?frameUrl=%2Fconsole%2Fphone-numbers%2Fincoming%3Fx-target-region%3Dus1
  #    c.update!(host: 'd635-31-179-57-73.ngrok.io')
  # 3. Add to back-safe.env: OVERRIDE_HOST=d635-31-179-57-73.ngrok.io
  # 4. Texting::SendCampaignJob.perform_now(Texting::Campaign.create!(phone_numbers: ['+YOUR_NUMBER'], message: 'Hello', status: :sending))
  # 5. See the console logs and a message on your phone
  post 'web_api/v1/texting_campaigns/:id/mark_as_sent', document: false do
    let(:campaign) do
      create(:texting_campaign, phone_numbers: ['+12345678911'], message: 'Hello', status: :sending)
    end

    let(:id) { campaign.id }
    header 'X-Twilio-Signature', 'signature'

    example 'Status changed if validation succeeds' do
      validator = Twilio::Security::RequestValidator.new('auth_token')
      expect(Twilio::Security::RequestValidator).to receive(:new).once.and_return(validator)
      expect(validator).to receive(:validate).once.and_return(true)

      do_request
      expect(response_status).to eq 200
      expect(campaign.reload.status).to eq('sent')
    end

    example 'Status not changed if validation fails' do
      validator = Twilio::Security::RequestValidator.new('auth_token')
      expect(Twilio::Security::RequestValidator).to receive(:new).once.and_return(validator)
      expect(validator).to receive(:validate).once.and_return(false)

      do_request
      expect(response_status).to eq 401
      expect(campaign.reload.status).to eq('sending')
    end
  end

  delete 'web_api/v1/texting_campaigns/:id' do
    let!(:id) { create(:texting_campaign).id }

    example 'Delete a campaign' do
      old_count = Texting::Campaign.count
      do_request
      expect(response_status).to eq 200
      expect { Texting::Campaign.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect(Texting::Campaign.count).to eq(old_count - 1)
    end
  end
end
