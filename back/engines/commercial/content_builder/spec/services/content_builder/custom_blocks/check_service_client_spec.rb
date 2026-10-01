# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::CustomBlocks::CheckServiceClient do
  subject(:client) { described_class.new }

  let(:build_url) { 'http://check_service:3100/build' }
  let(:payload) do
    { source: 'export default () => null;', manifest: {}, messages: {}, locales: ['en'] }
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('CHECK_SERVICE_SECRET', nil).and_return('test-secret')
  end

  describe '#build' do
    it 'returns what the service answered' do
      stub_request(:post, build_url).to_return(
        status: 200,
        body: { ok: true, bundle: 'export default () => null;', diagnostics: [] }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )

      expect(client.build(**payload)).to include('ok' => true)
    end

    it 'authenticates with the shared secret' do
      stub_request(:post, build_url).to_return(status: 200, body: '{}')

      client.build(**payload)

      expect(a_request(:post, build_url).with(headers: { 'X-Check-Secret' => 'test-secret' })).to have_been_made
    end

    it 'sends the source, manifest, messages and locales' do
      stub_request(:post, build_url).to_return(status: 200, body: '{}')

      client.build(**payload)

      expect(a_request(:post, build_url).with(body: payload.to_json)).to have_been_made
    end

    # A build that ran and failed is the model's problem; a service that did not
    # answer is ours, and the two must not look alike to the caller.
    it 'raises Unavailable on a non-success response' do
      stub_request(:post, build_url).to_return(status: 503, body: 'busy')

      expect { client.build(**payload) }
        .to raise_error described_class::Unavailable, /responded with 503/
    end

    it 'raises Unavailable when the service cannot be reached' do
      stub_request(:post, build_url).to_timeout

      expect { client.build(**payload) }.to raise_error described_class::Unavailable, /unreachable/
    end

    it 'raises Unavailable on a response that is not JSON' do
      stub_request(:post, build_url).to_return(status: 200, body: '<html>nope</html>')

      expect { client.build(**payload) }.to raise_error described_class::Unavailable, /not JSON/
    end

    it 'raises Unavailable rather than calling out unauthenticated' do
      allow(ENV).to receive(:fetch).with('CHECK_SERVICE_SECRET', nil).and_return(nil)

      expect { client.build(**payload) }
        .to raise_error described_class::Unavailable, /not configured/
      expect(a_request(:post, build_url)).not_to have_been_made
    end
  end

  describe '#up?' do
    it 'is true when the health endpoint answers' do
      stub_request(:get, 'http://check_service:3100/health').to_return(status: 200, body: '{}')

      expect(client).to be_up
    end

    it 'is false when it does not' do
      stub_request(:get, 'http://check_service:3100/health').to_timeout

      expect(client).not_to be_up
    end
  end
end
