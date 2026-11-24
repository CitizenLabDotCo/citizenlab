# frozen_string_literal: true

require 'rails_helper'
require 'vcr'

RSpec.describe Matomo::Client do
  subject(:service) { described_class.new(base_uri, auth_token) }

  let(:base_uri) { 'https://demo.matomo.cloud' }
  let(:auth_token) { 'anonymous' }

  describe '.new' do
    context 'when getting config from the environment' do
      before do
        stub_const('ENV', ENV.to_h.except('MATOMO_HOST', 'MATOMO_AUTHORIZATION_TOKEN'))
      end

      it 'raises an error if MATOMO_HOST is missing' do
        stubbed_env = ENV.to_h
          .except('MATOMO_HOST')
          .merge('MATOMO_AUTHORIZATION_TOKEN' => auth_token)
        stub_const('ENV', stubbed_env)

        expect { described_class.new }
          .to raise_error(Matomo::Client::MissingBaseUriError)
      end

      it 'raises an error if MATOMO_AUTHORIZATION_TOKEN is missing' do
        stubbed_env = ENV.to_h
          .except('MATOMO_AUTHORIZATION_TOKEN')
          .merge('MATOMO_HOST' => base_uri)
        stub_const('ENV', stubbed_env)

        expect { described_class.new }
          .to raise_error(Matomo::Client::MissingAuthorizationTokenError)
      end
    end
  end

  describe '#delete_data_subjects' do
    let(:visits) do
      [{ 'idSite' => 1, 'idVisit' => 2 }, { 'idSite' => 3, 'idVisit' => 4 }]
    end

    it 'sends a properly formatted request to matomo API' do
      allow(HTTParty).to receive(:post)

      service.delete_data_subjects(visits)

      expect(HTTParty).to have_received(:post) do |path, options|
        expect(path).to eq(service.instance_variable_get(:@index_php_uri))
        expect(options[:headers]).to eq({ 'Content-Type' => 'application/x-www-form-urlencoded' })

        expect(options[:query]).to eq({
          'module' => 'API',
          'method' => 'PrivacyManager.deleteDataSubjects',
          'format' => 'JSON'
        })

        expect(options[:body]).to eq({
          'visits[0][idsite]' => 1,
          'visits[0][idvisit]' => 2,
          'visits[1][idsite]' => 3,
          'visits[1][idvisit]' => 4,
          'token_auth' => auth_token
        })
      end
    end
  end

  def with_vcr_cassette(&block)
    library_dir = Matomo::Engine.root / 'spec' / 'fixtures' / 'vcr_cassettes'

    VcrHelper.use_cassette_library_dir(library_dir) do
      VCR.use_cassette('matomo_client', &block)
    end
  end

  describe '#get_last_visits_details' do
    it 'retrieves visits details' do
      site_id = 1
      period = 'day'
      date = 'yesterday'
      filter_limit = 3
      filter_offset = 2

      with_vcr_cassette do
        response = service.get_last_visits_details(
          site_id, period: period, date: date, filter_limit: filter_limit, filter_offset: filter_offset
        )

        expect(response.code).to eq(200)
        expect(response.pluck('idSite')).to all eq('1')
        expect(response.count).to eq(filter_limit)
      end
    end
  end

  describe '#find_data_subjects' do
    let(:user_id) { 'user-id' }

    it 'sends a properly formatted request to matomo API' do
      allow(HTTParty).to receive(:post)

      service.find_data_subjects(user_id)

      expect(HTTParty).to have_received(:post) do |path, options|
        expect(path).to eq(service.instance_variable_get(:@index_php_uri))
        expect(options[:body]).to eq({ 'token_auth' => auth_token })
        expect(options[:headers]).to eq({ 'Content-Type' => 'application/x-www-form-urlencoded' })
        expect(options[:query]).to eq({
          'idSite' => 'all',
          'module' => 'API',
          'method' => 'PrivacyManager.findDataSubjects',
          'segment' => "userId==#{user_id}",
          'format' => 'JSON'
        })
      end
    end
  end

  describe '#find_data_subjects with several users' do
    it 'ORs the users in the segment' do
      allow(HTTParty).to receive(:post)

      service.find_data_subjects(%w[user-1 user-2])

      expect(HTTParty).to have_received(:post) do |_path, options|
        expect(options[:query]['segment']).to eq('userId==user-1,userId==user-2')
      end
    end
  end

  describe '#delete_user_data' do
    let(:index_php) { "#{base_uri}/index.php" }
    let(:visits) { [{ 'idSite' => 1, 'idVisit' => 10 }] }
    let!(:delete_request) do
      stub_request(:post, index_php)
        .with(query: hash_including('method' => 'PrivacyManager.deleteDataSubjects'))
        .to_return(json({ 'log_visit' => 1 }))
    end

    def json(payload)
      { status: 200, body: payload.to_json, headers: { 'Content-Type' => 'application/json' } }
    end

    def stub_find_data_subjects(segment, *payloads)
      stub_request(:post, index_php)
        .with(query: hash_including('method' => 'PrivacyManager.findDataSubjects', 'segment' => segment))
        .to_return(*payloads.map { |payload| json(payload) })
    end

    it 'looks up the users USERS_PER_REQUEST at a time, until no visits are left' do
      stub_const("#{described_class}::USERS_PER_REQUEST", 2)
      first_batch = stub_find_data_subjects('userId==user-1,userId==user-2', visits, [])
      second_batch = stub_find_data_subjects('userId==user-3', [])

      summary = service.delete_user_data(%w[user-1 user-2 user-3])

      expect(first_batch).to have_been_requested.twice
      expect(second_batch).to have_been_requested.once
      expect(delete_request).to have_been_requested.once
      expect(summary).to eq({ 'log_visit' => 1 })
    end

    it 'returns nil when no data was found' do
      stub_find_data_subjects('userId==user-1', [])

      expect(service.delete_user_data('user-1')).to be_nil
      expect(delete_request).not_to have_been_requested
    end
  end

  describe '#error?' do
    using RSpec::Parameterized::TableSyntax

    where(:is_success, :payload, :expected_result) do
      true  | { 'result' => 'error', 'message' => 'Some description...' } | true
      true  | { 'result' => 'not-error', 'message' => 'Some description...' } | false
      true  | { 'property' => 'value' } | false
      true  | %w[value value2] | false
      false | 'whatever' | true
    end

    with_them do
      specify do
        response = instance_double(
          HTTParty::Response, parsed_response: payload, success?: is_success
        )

        expect(service.send(:error?, response)).to eq(expected_result)
      end
    end
  end

  describe '#raise_if_error' do
    context 'when the request failed' do
      let(:error_message) { 'Some error message...' }

      context 'and the payload is a json object' do
        let(:response) do
          instance_double(
            HTTParty::Response,
            success?: true, # Matomo API returns 200 even for failed requests
            parsed_response: { 'result' => 'error', 'message' => error_message }
          )
        end

        specify do
          expect { service.raise_if_error(response) }
            .to raise_error(Matomo::Client::MatomoApiError, error_message)
        end
      end

      context 'and the payload is a string' do
        let(:response) do
          instance_double(
            HTTParty::Response,
            success?: false,
            parsed_response: error_message
          )
        end

        specify do
          expect { service.raise_if_error(response) }
            .to raise_error(Matomo::Client::MatomoApiError, error_message)
        end
      end
    end
  end
end
