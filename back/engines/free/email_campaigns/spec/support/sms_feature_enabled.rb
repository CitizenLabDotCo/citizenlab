# frozen_string_literal: true

# Enables the `sms` feature with test Twilio credentials
RSpec.shared_context 'with sms feature enabled' do
  before do
    SettingsService.new.activate_feature!('sms', settings: {
      'twilio_account_sid' => 'AC_test',
      'twilio_auth_token' => 'token',
      'twilio_manual_campaigns_messaging_service_sid' => 'MG_manual_campaigns',
      'twilio_confirmation_codes_messaging_service_sid' => 'MG_confirmation_codes'
    })
  end
end

# Enables `sms_manual_campaigns` on top of `sms`, which holds the Twilio settings
RSpec.shared_context 'with sms manual campaigns feature enabled' do
  include_context 'with sms feature enabled'

  before { SettingsService.new.activate_feature!('sms_manual_campaigns') }
end
