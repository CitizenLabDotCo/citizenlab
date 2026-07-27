# frozen_string_literal: true

# Enables the `sms` feature with test Twilio credentials
RSpec.shared_context 'with sms feature enabled' do
  before do
    SettingsService.new.activate_feature!('sms', settings: {
      'twilio_account_sid' => 'AC_test',
      'twilio_auth_token' => 'token',
      'twilio_messaging_service_sid' => 'MG_test'
    })
  end
end
