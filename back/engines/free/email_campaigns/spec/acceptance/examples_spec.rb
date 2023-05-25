# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Campaing examples' do
  explanation 'Examples of previously sent-out email campaigns, used to help the user understand email content.'

  before do
    header 'Content-Type', 'application/json'
    @admin = create(:admin)
    header_token_for @admin
  end

  get '/web_api/v1/campaigns/:campaign_id/examples' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of examples per page'
    end

    let(:campaign1) { create(:admin_rights_received_campaign) }
    let(:campaign2) { create(:comment_deleted_by_admin_campaign) }
    let(:examples) { create_list(:campaign_example, 3, campaign: campaign1) }
    let!(:other_campaign_example) { create(:campaign_example, campaign: campaign2) }
    let(:campaign_id) { examples.first.campaign_id }

    example_request 'List all examples for a specific campaign' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].pluck(:id)).not_to include(other_campaign_example.id)
    end
  end

  get '/web_api/v1/campaigns/examples/:id' do
    let(:example1) { create(:campaign_example) }
    let(:id) { example1.id }

    example_request 'Get one campaign example by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
      expect(json_response[:data]).to include({
        id: id,
        type: 'example',
        attributes: a_hash_including({
          mail_body_html: kind_of(String),
          locale: 'en',
          subject: 'You became an administrator on the platform of Liege',
          created_at: kind_of(String),
          updated_at: kind_of(String)
        }),
        relationships: {
          campaign: {
            data: {
              id: example1.campaign_id,
              type: 'campaign'
            }
          },
          recipient: {
            data: {
              id: example1.recipient.id,
              type: 'user'
            }
          }
        }
      })
    end
  end
end
