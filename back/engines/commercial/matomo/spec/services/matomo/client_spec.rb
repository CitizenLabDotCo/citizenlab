# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Matomo::Client do
  subject(:service) { described_class.new(base_uri, auth_token) }

  let(:base_uri) { 'matomo-host.citizenlab.co' }
  let(:auth_token) { 'auth-token' }

  describe '#delete_data_subjects' do
    let(:visits) do
      [{ 'idSite' => 1, 'idVisit' => 2 }, { 'idSite' => 3, 'idVisit' => 4 }]
    end

    # rubocop:disable RSpec/MultipleExpectations, RSpec/ExampleLength
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
    # rubocop:enable RSpec/MultipleExpectations, RSpec/ExampleLength
  end

  describe '#find_data_subjects' do
    let(:user_id) { 'user-id' }

    # rubocop:disable RSpec/MultipleExpectations, RSpec/ExampleLength
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
    # rubocop:enable RSpec/MultipleExpectations, RSpec/ExampleLength
  end

  describe '#error?' do
    using RSpec::Parameterized::TableSyntax

    where(:payload, :expected_result) do
      { 'result' => 'error', 'message' => 'Some description...' } | true
      { 'result' => 'not-error', 'message' => 'Some description...' } | false
      { 'property' => 'value' } | false
      %w[value value2] | false
    end

    with_them do
      specify do
        response = instance_double(HTTParty::Response, parsed_response: payload)
        expect(service.send(:error?, response)).to eq(expected_result)
      end
    end
  end

  describe '#raise_if_error' do
    context 'when error' do
      let(:response) do
        instance_double(
          HTTParty::Response,
          parsed_response: { 'result' => 'error', 'message' => error_message }
        )
      end
      let(:error_message) { 'Some error message...' }

      specify do
        expect { service.send(:raise_if_error, response) }
          .to raise_error(Matomo::Client::MatomoApiError, error_message)
      end
    end
  end
end
