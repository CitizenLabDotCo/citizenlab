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

        it { expect { service }.to raise_error(KeyError) }
      end

      context 'when NLP_API_TOKEN env variable is not defined' do
        before { stub_const('ENV', ENV.to_h.except('NLP_API_TOKEN')) }

        it { expect { service }.to raise_error(KeyError) }
      end

      context 'when environment contains NLP_HOST and NLP_API_TOKEN' do
        it { expect(service.base_uri).to eq(ENV['NLP_HOST']) }
        it { expect(service.authorization_token).to eq(ENV['NLP_API_TOKEN']) }
      end
    end
    # rubocop:enable RSpec/NestedGroups
  end

  describe '#text_network_analysis' do
    it 'sends a request with an authorization header' do
      response = instance_double(HTTParty::Response, 'success?': true, parsed_response: {})
      allow(HTTParty).to receive(:post).and_return(response)
      service.text_network_analysis('tenant-id', 'project-id', 'en')

      expect(HTTParty).to have_received(:post) do |_path, options|
        authorization_header = options.dig(:headers, 'Authorization')
        expect(authorization_header).to eq("Token #{authorization_token}")
      end
    end
  end

  describe '#text_network_analysis_by_ids' do
    let(:response) do
      instance_double(
        HTTParty::Response,
        code: 200, success?: true, parsed_response: response_body
      )
    end
    let(:response_body) do
      { 'data' => [
        { language: 'en', task_id: 'en-id' },
        { language: 'es', task_id: 'es-id' }
      ] }
    end

    before { allow(HTTParty).to receive(:post).and_return(response) }

    it 'sends a well-formed request to the NLP service' do
      input_ids = Array.new(3) { SecureRandom.uuid }
      tna_options = { max_nodes: 100, min_degree: 3 }

      service.text_network_analysis_by_ids('tenant-id', input_ids, **tna_options)

      expect(HTTParty).to have_received(:post) do |path, options|
        expect(path).to eq('/v2/tenants/tenant-id/text_network_analysis')

        expected_headers = {
          'Authorization' => 'Token authorization-token',
          'Content-Type' => 'application/json'
        }
        expect(options[:headers]).to eq(expected_headers)

        body = JSON.parse(options[:body])
        expect(body).to eq(tna_options.merge(input_identifiers: input_ids).stringify_keys)
      end
    end

    it 'parses the response correctly' do
      result = service.text_network_analysis_by_ids('tenant-id', ['input-uuid'])
      expect(result).to eq({ 'en' => 'en-id', 'es' => 'es-id' })
    end
  end

  describe '#cancel_tasks' do
    let(:response) { instance_double(HTTParty::Response, code: 200) }
    let(:task_ids) { %w[uuid-1 uuid-2] }

    before { allow(HTTParty).to receive(:post).and_return(response) }

    it 'sends a well-formed request to the NLP service' do
      service.cancel_tasks(task_ids)

      expect(HTTParty).to have_received(:post) do |path, options|
        expected_headers = {
          'Authorization' => 'Token authorization-token',
          'Content-Type' => 'application/json'
        }
        expect(options[:headers]).to eq(expected_headers)
        expect(options[:body]).to eq({ ids: task_ids }.to_json)
        expect(path).to eq('/v2/async_api/cancel')
      end
    end

    it 'returns the response from the NLP service' do
      result = service.cancel_tasks(task_ids)
      expect(result).to eq(response)
    end
  end
end
