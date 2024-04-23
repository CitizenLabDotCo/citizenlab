require 'rails_helper'

# TODO
# Refactoring
# Add retry for persons + wait less long + reusable method

describe PosthogIntegration::PostHog::Client do
  let(:base_uri) { 'https://example.com' }
  let(:api_key) { 'fake_api_key' }
  let(:project_id) { 'fake_project_id' }
  let(:posthog) { described_class.new(base_uri: base_uri, api_key: api_key).tap { |client| client.default_project_id = project_id } }
  let(:user) { create(:user) }
  let(:person_id) { 0 }

  describe 'delete_person_by_distinct_id' do
    before { allow(posthog).to receive(:sleep) } # Don't sleep while testing

    it 'sends a delete request' do

      # TODO fixture json file
      persons_response = <<~JSON_RESPONSE
        {
          "next": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "previous": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "count": 400,
          "results": [
            {
              "id": #{person_id},
              "name": "string",
              "distinct_ids": [
                "string"
              ],
              "properties": null,
              "created_at": "2019-08-24T14:15:22Z",
              "uuid": "095be615-a8ad-4c33-8e9c-c7612fbf6c9f"
            }
          ]
        }
      JSON_RESPONSE
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 200, body: persons_response, headers: { 'Content-Type' => 'application/json' })
      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/#{person_id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 204)

      expect { posthog.delete_person_by_distinct_id(user.id) }.not_to raise_error
    end

    it 'reports error when response is 429 (GET person) and retries is 0' do
      persons_response = <<~JSON_RESPONSE
        {
          "next": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "previous": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "count": 400,
          "results": [
            {
              "id": #{person_id},
              "name": "string",
              "distinct_ids": [
                "string"
              ],
              "properties": null,
              "created_at": "2019-08-24T14:15:22Z",
              "uuid": "095be615-a8ad-4c33-8e9c-c7612fbf6c9f"
            }
          ]
        }
      JSON_RESPONSE
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 429)
      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/#{person_id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 204)

      expect { posthog.delete_person_by_distinct_id(user.id, retries: 0) }.to raise_error(PosthogIntegration::PostHog::Client::ApiError)
    end

    it 'reports error when response is 429 (DELETE person) and retries is 0' do
      persons_response = <<~JSON_RESPONSE
        {
          "next": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "previous": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "count": 400,
          "results": [
            {
              "id": #{person_id},
              "name": "string",
              "distinct_ids": [
                "string"
              ],
              "properties": null,
              "created_at": "2019-08-24T14:15:22Z",
              "uuid": "095be615-a8ad-4c33-8e9c-c7612fbf6c9f"
            }
          ]
        }
      JSON_RESPONSE
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 200, body: persons_response, headers: { 'Content-Type' => 'application/json' })
      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/#{person_id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 429)

      expect { posthog.delete_person_by_distinct_id(user.id, retries: 0) }.to raise_error(PosthogIntegration::PostHog::Client::ApiError)
    end

    it 'retries when response is 429 (DELETE person) and retries > 0' do
      persons_response = <<~JSON_RESPONSE
        {
          "next": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "previous": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "count": 400,
          "results": [
            {
              "id": #{person_id},
              "name": "string",
              "distinct_ids": [
                "string"
              ],
              "properties": null,
              "created_at": "2019-08-24T14:15:22Z",
              "uuid": "095be615-a8ad-4c33-8e9c-c7612fbf6c9f"
            }
          ]
        }
      JSON_RESPONSE
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 200, body: persons_response, headers: { 'Content-Type' => 'application/json' })
      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/#{person_id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 429)
      allow(posthog).to receive(:delete_person).with(person_id, project_id: project_id, retries: 3).and_call_original
      status = double()
      status.stub(:client_error?).and_return(false)
      status.stub(:server_error?).and_return(false)
      response = double()
      response.stub(:status).and_return(status)
      allow(posthog).to receive(:delete_person).with(person_id, project_id: project_id, retries: 2).and_return(response) # HTTP::Response.new(status: 429, request: nil, connection: nil, version: '1.1'))
      posthog.delete_person_by_distinct_id(user.id, retries: 3)
      expect(posthog).to have_received(:delete_person).twice
    end

    it 'reports error when response is not 429 and retries > 0' do
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 401)
        expect { posthog.delete_person_by_distinct_id(user.id, retries: 3) }.to raise_error(PosthogIntegration::PostHog::Client::ApiError)
    end
  end
end
