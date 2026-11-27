# frozen_string_literal: true

module EmailCampaigns
  # Tracks permanent bounces reported by the email provider, so the platform stops
  # emailing addresses that cannot receive mail. Repeated bounces hurt the sending
  # reputation and can get sending suspended.
  class EmailBounceService
    # Other permanent failures (unsubscribes, spam complaints, emails rejected
    # as spam) say nothing about whether the address exists.
    MAILGUN_BOUNCE_REASONS = %w[bounce suppress-bounce].freeze

    # @param event_data [Hash] the `event-data` of a Mailgun webhook event
    def handle_mailgun_event(event_data)
      return unless mailgun_bounce?(event_data)

      record_bounce(event_data[:recipient], mailgun_reason(event_data))
    end

    # Marks the user with that address as bounced.
    # @param email [String] the recipient address as reported by the provider
    # @param reason [String, nil] the provider's explanation
    def record_bounce(email, reason)
      user = User.find_by_cimail(email)
      # A provider can report the same address more than once; keep the first bounce.
      return if !user || user.email_bounced?

      # Skips validations: a user with unrelated invalid data must still stop
      # receiving emails.
      user.update_columns(email_bounced_at: Time.zone.now, email_bounce_reason: reason)
      LogActivityJob.perform_later(user, 'email_bounced', nil, Time.now.to_i, payload: { reason: reason })
    end

    private

    def mailgun_bounce?(event_data)
      event_data[:event] == 'failed' && event_data[:severity] == 'permanent' &&
        MAILGUN_BOUNCE_REASONS.include?(event_data[:reason])
    end

    def mailgun_reason(event_data)
      status = event_data[:'delivery-status'] || {}
      [status[:code], status[:description].presence || status[:message]].compact_blank.join(' ').presence
    end
  end
end
