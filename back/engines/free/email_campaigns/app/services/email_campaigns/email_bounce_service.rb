# frozen_string_literal: true

module EmailCampaigns
  # Tracks permanent bounces reported by Mailgun, so the platform stops emailing
  # addresses that cannot receive mail. Repeated bounces hurt the sending
  # reputation and can get sending suspended.
  class EmailBounceService
    # @param event_data [Hash] the `event-data` of a Mailgun webhook event
    def handle_mailgun_event(event_data)
      return unless permanent_failure?(event_data)

      user = User.find_by_cimail(event_data[:recipient])
      return unless user

      # Skips validations: a user with unrelated invalid data must still stop
      # receiving emails.
      user.update_columns(email_bounced_at: Time.zone.now, email_bounce_reason: reason(event_data))
    end

    # Mailgun keeps its own list of bounced addresses and skips sending to them.
    # It must be cleared too, or the email still won't arrive.
    def clear(user)
      remove_from_mailgun_bounces(user.email) if user.email.present?
      user.update_columns(email_bounced_at: nil, email_bounce_reason: nil)
    end

    private

    def permanent_failure?(event_data)
      event_data[:event] == 'failed' && event_data[:severity] == 'permanent'
    end

    def reason(event_data)
      status = event_data[:'delivery-status'] || {}
      [status[:code], status[:description].presence || status[:message]].compact_blank.join(' ').presence
    end

    def remove_from_mailgun_bounces(email)
      return unless ActionMailer::Base.delivery_method == :mailgun

      settings = ActionMailer::Base.mailgun_settings
      client = Mailgun::Client.new(settings[:api_key], settings[:api_host])
      client.delete("#{settings[:domain]}/bounces/#{ERB::Util.url_encode(email)}")
    rescue Mailgun::CommunicationError => e
      # 404: Mailgun has no bounce for this address. Any other failure is
      # reported but doesn't block the clear: if Mailgun still suppresses the
      # address, the next email fails and the bounce is recorded again.
      ErrorReporter.report(e) unless e.code == 404
    end
  end
end
