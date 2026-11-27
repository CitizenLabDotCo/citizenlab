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

  describe '#report_invalid_record' do
    using RSpec::Parameterized::TableSyntax

    def invalid_record_error(user)
      user.validate
      ActiveRecord::RecordInvalid.new(user)
    end

    blocked_email = "someone@#{User::EMAIL_DOMAIN_BLACKLIST.first}"

    where(:case_name, :email, :locale, :reported) do
      'the email domain is blocked'            | blocked_email  | 'en' | false
      'there are other errors as well'         | blocked_email  | 'xx' | true
      'there are only other validation errors' | 'not-an-email' | 'en' | true
    end

    with_them do
      it 'reports only when the user is not rejected by the email rules alone' do
        error = invalid_record_error(build(:user, email: email, locale: locale))

        if reported
          expect(ErrorReporter).to receive(:report)
        else
          expect(ErrorReporter).not_to receive(:report)
        end

        service.report_invalid_record(error, 'fake_sso', '1.2.3.4')
      end
    end

    it 'logs a banned email as an activity instead of reporting it' do
      ban = EmailBan.ban!('banned@example.com')
      error = invalid_record_error(build(:user, email: 'banned@example.com'))

      expect(ErrorReporter).not_to receive(:report)
      expect { service.report_invalid_record(error, 'fake_sso', '1.2.3.4') }
        .to have_enqueued_job(LogActivityJob).with(ban, 'banned_email_used', nil, anything, payload: { remote_ip: '1.2.3.4' })
    end

    it 'treats a blocked new email like a blocked email' do
      user = create(:user)
      user.new_email = "someone@#{User::EMAIL_DOMAIN_BLACKLIST.first}"

      expect(ErrorReporter).not_to receive(:report)

      service.report_invalid_record(invalid_record_error(user), 'fake_sso', '1.2.3.4')
    end

    it 'groups other errors by provider, record and validation error key' do
      error = invalid_record_error(build(:user, email: 'not-an-email'))

      expect(ErrorReporter).to receive(:report).with(
        error,
        extra: { provider: 'fake_sso', record: 'User', validation_errors: ['email.invalid'] },
        fingerprint: %w[omniauth-invalid-record fake_sso User email.invalid]
      )

      service.report_invalid_record(error, 'fake_sso', '1.2.3.4')
    end
  end
end
