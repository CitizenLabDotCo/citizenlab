require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Texting campaigns' do
  before do
    header 'Content-Type', 'application/json'
    user = create(:admin)
    token = Knock::AuthToken.new(payload: user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
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
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get '/web_api/v1/texting_campaigns/:id' do
    let(:campaign) { create(:texting_campaign) }
    let(:id) { campaign.id }

    example_request 'Get one campaign by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  post 'web_api/v1/texting_campaigns' do
    with_options scope: :campaign do
      parameter :phone_numbers, 'Phone numbers the campaign is sent to', required: true
      parameter :message, 'The body of the texting campaign. Plain text', required: true
    end

    let(:phone_numbers) { ['+22222', '+11111'] }
    let(:message) { 'Join our platform!' }

    example_request 'Create a campaign' do
      expect(response_status).to eq 201
      expect(json_response_body.dig(:data, :attributes, :phone_numbers)).to match_array(['+22222', '+11111'])
      expect(json_response_body.dig(:data, :attributes, :message)).to eq(message)

      campaign = Texting::Campaign.last
      expect(campaign.phone_numbers).to match_array(['+22222', '+11111'])
      expect(campaign.message).to eq(message)
    end
  end

  patch 'web_api/v1/texting_campaigns/:id' do
    with_options scope: :campaign do
      parameter :phone_numbers, 'Phone numbers the campaign is sent to', required: true
      parameter :message, 'The body of the texting campaign. Plain text', required: true
    end

    let(:campaign) do
      create(:texting_campaign, phone_numbers: ['+33333'], message: 'Hello')
    end

    let(:id) { campaign.id }
    let(:phone_numbers) { ['+22222', '+11111'] }
    let(:message) { 'Join our platform!' }

    example_request 'Update a campaign' do
      expect(response_status).to eq 200
      expect(json_response_body.dig(:data, :attributes, :phone_numbers)).to match_array(['+22222', '+11111'])
      expect(json_response_body.dig(:data, :attributes, :message)).to eq(message)

      campaign = Texting::Campaign.last
      expect(campaign.phone_numbers).to match_array(['+22222', '+11111'])
      expect(campaign.message).to eq(message)
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
