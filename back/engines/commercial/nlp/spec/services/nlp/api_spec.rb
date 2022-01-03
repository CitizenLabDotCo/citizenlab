# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NLP::Api do
  subject(:service) do
    described_class.new(
      base_uri: base_uri,
      authorization_token: authorization_token
    )
  end

  let(:base_uri) { 'https://nlp.api.citizenlab.co' }
  let(:authorization_token) { 'authorization-token' }

  describe '.new' do
    context 'when arguments are provided' do
      specify do
        expect(service.base_uri).to eq(base_uri)
        expect(service.authorization_token).to eq(authorization_token)
      end
    end

    # rubocop:disable RSpec/NestedGroups
    context 'when arguments are not provided' do
      let(:base_uri) { nil }
      let(:authorization_token) { nil }

      before do
        stubbed_env = ENV.to_h.merge(
          'NLP_HOST' => 'https://env-nlp.api.citizenlab.co',
          'NLP_API_TOKEN' => 'env-authorization-token',
        )

        stub_const('ENV', stubbed_env)
      end

      context 'when NLP_HOST env variable is not defined' do
        before { stub_const('ENV', ENV.to_h.except('NLP_HOST')) }

        it { expect{ service }.to raise_error(KeyError) }
      end

      context 'when NLP_API_TOKEN env variable is not defined' do
        before { stub_const('ENV', ENV.to_h.except('NLP_API_TOKEN')) }

        it { expect{ service }.to raise_error(KeyError) }
      end

      context 'when environment contains NLP_HOST and NLP_API_TOKEN' do
        it { expect(service.base_uri).to eq(ENV['NLP_HOST']) }
        it { expect(service.authorization_token).to eq(ENV['NLP_API_TOKEN']) }
      end
    end
    # rubocop:enable RSpec/NestedGroups
  end

  describe '#text_network_analysis' do
    # rubocop:disable RSpec/SubjectStub
    it 'send a request with an authorization header' do
      response = instance_double(HTTParty::Response, 'success?': true, parsed_response: {})
      allow(service).to receive(:post).and_return(response)
      service.text_network_analysis('tenant-id', 'project-id', 'en')

      expect(service).to have_received(:post) do |_path, options|
        authorization_header = options.dig(:headers, 'Authorization')
        expect(authorization_header).to eq("Token #{authorization_token}")
      end
    end
    # rubocop:enable RSpec/SubjectStub
  end
end
