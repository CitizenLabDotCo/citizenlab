# frozen_string_literal: true

require 'rails_helper'

describe OmniauthFailureService do
  subject(:service) { described_class.new }

  let(:strategy) { instance_double(OmniAuth::Strategies::OAuth2, name: 'azureactivedirectory') }
  let(:base_env) { Rack::MockRequest.env_for('https://example.org/auth/azureactivedirectory/callback') }

  describe '#report' do
    it 'reports the error, grouped by strategy and error class, with the error type as a tag' do
      error = OmniAuth::Strategies::OAuth2::CallbackError.new(:invalid_request, 'Bad request')
      env = base_env.merge(
        'omniauth.error' => error,
        'omniauth.error.type' => :invalid_request,
        'omniauth.error.strategy' => strategy
      )

      expect(Sentry).to receive(:set_tags).with(omniauth_error_type: 'invalid_request')
      expect(ErrorReporter).to receive(:report).with(
        error,
        extra: { error_type: 'invalid_request', strategy: 'azureactivedirectory', host: 'example.org' },
        fingerprint: %w[omniauth-failure azureactivedirectory OmniAuth::Strategies::OAuth2::CallbackError]
      )

      service.report(env)
    end

    it 'adds the HTTP status, response body and cause when the error has them' do
      error_class = Class.new(StandardError) do
        def status = 403
        def response = { body: '<html>Blocked by WAF</html>' }
      end
      error = begin
        begin
          raise IOError, 'connection reset'
        rescue IOError
          raise error_class, 'Unknown'
        end
      rescue StandardError => e
        e
      end
      env = base_env.merge(
        'omniauth.error' => error,
        'omniauth.error.type' => :invalid_credentials,
        'omniauth.error.strategy' => strategy
      )

      expect(ErrorReporter).to receive(:report).with(
        error,
        extra: {
          error_type: 'invalid_credentials',
          strategy: 'azureactivedirectory',
          host: 'example.org',
          http_status: 403,
          response_body: '<html>Blocked by WAF</html>',
          cause_class: 'IOError',
          cause_message: 'connection reset'
        },
        fingerprint: anything
      )

      service.report(env)
    end

    it 'groups failures without an exception per strategy, whatever the (request-supplied) error type' do
      env = base_env.merge('omniauth.error.type' => :some_random_value, 'omniauth.error.strategy' => strategy)

      expect(ErrorReporter).to receive(:report_msg).with(
        'OmniAuth failure: some_random_value',
        extra: { error_type: 'some_random_value', strategy: 'azureactivedirectory', host: 'example.org' },
        fingerprint: %w[omniauth-failure azureactivedirectory none]
      )

      service.report(env)
    end

    it 'uses placeholders in the fingerprint when the strategy is unknown' do
      expect(ErrorReporter).to receive(:report_msg).with(
        'OmniAuth failure: unknown',
        extra: anything,
        fingerprint: %w[omniauth-failure unknown none]
      )

      service.report(base_env)
    end

    it 'logs instead of raising when reporting fails' do
      env = base_env.merge('omniauth.error.type' => :invalid_credentials, 'omniauth.error.strategy' => strategy)
      allow(ErrorReporter).to receive(:report_msg).and_raise(StandardError, 'Sentry is down')

      expect(Rails.logger).to receive(:error).with('Could not report OmniAuth failure: StandardError: Sentry is down')
      expect { service.report(env) }.not_to raise_error
    end
  end
end
