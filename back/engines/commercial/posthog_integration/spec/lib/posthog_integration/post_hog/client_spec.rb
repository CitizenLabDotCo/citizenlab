require 'rails_helper'

describe PosthogIntegration::PostHog::Client do
  let(:base_uri) { 'https://example.com' }
  let(:api_key) { 'fake_api_key' }
  let(:project_id) { 'fake_project_id' }
  let(:posthog) { described_class.new(base_uri: base_uri, api_key: api_key, project_id: project_id) }
  let(:user) { create(:user) }
  let(:person_id) { 0 }

  describe 'delete_person_by_distinct_id' do
    before do
      allow(posthog).to receive(:sleep) # Don't sleep while testing

      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 200, body: persons_response(person_id), headers: { 'Content-Type' => 'application/json' })
      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/#{person_id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 204)
    end

    it 'sends a delete request' do
      allow(posthog).to receive(:delete_person).and_call_original
      expect { posthog.delete_person_by_distinct_id(user.id) }.not_to raise_error
      expect(posthog).to have_received(:delete_person).with(person_id, retries: anything).once
    end

    it 'raises error when response is 429 (GET persons) and retries is 0' do
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 429)

      expect { posthog.delete_person_by_distinct_id(user.id, retries: 0) }.to raise_error(PosthogIntegration::PostHog::Client::ApiError)
    end

    it 'raises error when response is 429 (DELETE persons) and retries is 0' do
      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/#{person_id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 429)

      expect { posthog.delete_person_by_distinct_id(user.id, retries: 0) }.to raise_error(PosthogIntegration::PostHog::Client::ApiError)
    end

    it 'retries when response is 429 (GET persons) and retries > 0' do
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 429)
      allow(posthog).to receive(:persons).with(distinct_id: user.id, retries: 3).and_call_original
      allow(posthog).to receive(:retry_request).with(retries: 3).and_call_original
      allow(posthog).to receive(:retry_request).with(retries: 2).and_return(stub_response)

      posthog.delete_person_by_distinct_id(user.id, retries: 3)

      expect(posthog).to have_received(:retry_request).thrice # Twice for persons, once for delete_person
    end

    it 'retries when response is 429 (DELETE persons) and retries > 0' do
      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/#{person_id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 429)
      allow(posthog).to receive(:delete_person).with(person_id, retries: 3).and_call_original
      allow(posthog).to receive(:retry_request).with(retries: 3).and_call_original
      allow(posthog).to receive(:retry_request).with(retries: 2).and_return(stub_response)

      posthog.delete_person_by_distinct_id(user.id, retries: 3)

      expect(posthog).to have_received(:retry_request).thrice # Once for persons, twice for delete_person
    end

    it 'raises error when response is not 429 (GET persons) and retries > 0' do
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 401)
      allow(posthog).to receive(:retry_request).and_call_original

      expect { posthog.delete_person_by_distinct_id(user.id, retries: 3) }.to raise_error(PosthogIntegration::PostHog::Client::ApiError)
      expect(posthog).to have_received(:retry_request).once
    end

    it 'raises error when response is not 429 (DELETE persons) and retries > 0' do
      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/#{person_id}")
        .with(headers: { 'Authorization' => "Bearer #{api_key}" })
        .to_return(status: 401)
      allow(posthog).to receive(:retry_request).and_call_original

      expect { posthog.delete_person_by_distinct_id(user.id, retries: 3) }.to raise_error(PosthogIntegration::PostHog::Client::ApiError)
      expect(posthog).to have_received(:retry_request).twice
    end
  end

  def stub_response
    status = double
    status.stub(:client_error?).and_return(false)
    status.stub(:server_error?).and_return(false)

    double.tap do |response|
      response.stub(:status).and_return(status)
      response.stub(:parse).and_return(JSON.parse(persons_response))
    end
  end

  def persons_response(person_id = 0)
    <<~JSON_RESPONSE
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
  end
end
