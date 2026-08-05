# frozen_string_literal: true

# Splits the single Twilio messaging service SID setting into one per SMS use case.
# The configured SID becomes the manual campaigns one; confirmation codes are left
# unset so they only start sending once their own messaging service is configured.
class SplitTwilioMessagingServiceSettings < ActiveRecord::Migration[7.1]
  OLD_KEY = 'twilio_messaging_service_sid'
  MANUAL_KEY = 'twilio_manual_campaigns_messaging_service_sid'
  CONFIRMATION_KEY = 'twilio_confirmation_codes_messaging_service_sid'

  def change
    return if Apartment::Tenant.current == 'public'

    app_config = AppConfiguration.instance
    return unless app_config

    settings = app_config.settings
    sms = settings['sms']
    return if sms.blank?

    reversible do |dir|
      dir.up do
        move_sid(sms, from: OLD_KEY, to: MANUAL_KEY)
        app_config.update!(settings: settings)
      end

      dir.down do
        move_sid(sms, from: MANUAL_KEY, to: OLD_KEY)
        sms.delete(CONFIRMATION_KEY)
        app_config.update!(settings: settings)
      end
    end
  end

  private

  def move_sid(sms, from:, to:)
    sid = sms.delete(from)
    sms[to] = sid if sid.present?
  end
end
