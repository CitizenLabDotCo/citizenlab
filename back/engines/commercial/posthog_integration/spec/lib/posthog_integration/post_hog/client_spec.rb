require 'rails_helper'

describe PosthogIntegration::PostHog::Client do
  let(:base_uri) { 'https://example.com' }
  let(:api_key) { 'fake_api_key' }
  let(:project_id) { 'fake_project_id' }
  let(:posthog) { described_class.new(base_uri: base_uri, api_key: api_key, project_id: project_id) }
  let(:bulk_delete_url) { "https://example.com/api/projects/#{project_id}/persons/bulk_delete" }

  describe 'delete_persons_by_distinct_ids' do
    before do
      allow(posthog).to receive(:sleep) # Don't sleep while testing
      stub_request(:post, bulk_delete_url).to_return(status: 202)
    end

    it 'deletes the persons with one request, without looking them up first' do
      posthog.delete_persons_by_distinct_ids(%w[user-1 user-2])

      expect(WebMock).to have_requested(:post, bulk_delete_url)
        .with(body: { distinct_ids: %w[user-1 user-2] }.to_json, headers: { 'Authorization' => "Bearer #{api_key}" })
        .once
    end

    it 'sends at most BULK_DELETE_LIMIT ids per request' do
      stub_const("#{described_class}::BULK_DELETE_LIMIT", 2)

      posthog.delete_persons_by_distinct_ids(%w[user-1 user-2 user-3])

      expect(WebMock).to have_requested(:post, bulk_delete_url).with(body: { distinct_ids: %w[user-1 user-2] }.to_json)
      expect(WebMock).to have_requested(:post, bulk_delete_url).with(body: { distinct_ids: %w[user-3] }.to_json)
    end

    it 'retries when the response is 429 and retries > 0' do
      stub_request(:post, bulk_delete_url).to_return({ status: 429 }, { status: 202 })

      expect { posthog.delete_persons_by_distinct_ids(%w[user-1], retries: 3) }.not_to raise_error
      expect(WebMock).to have_requested(:post, bulk_delete_url).twice
    end

    it 'raises an error when the response is 429 and retries is 0' do
      stub_request(:post, bulk_delete_url).to_return(status: 429)

      expect { posthog.delete_persons_by_distinct_ids(%w[user-1], retries: 0) }
        .to raise_error(PosthogIntegration::PostHog::Client::ApiError)
    end

    it 'raises an error without retrying when the response is another error' do
      stub_request(:post, bulk_delete_url).to_return(status: 401)

      expect { posthog.delete_persons_by_distinct_ids(%w[user-1], retries: 3) }
        .to raise_error(PosthogIntegration::PostHog::Client::ApiError)
      expect(WebMock).to have_requested(:post, bulk_delete_url).once
    end
  end
end
