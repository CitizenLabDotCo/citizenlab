# frozen_string_literal: true

module EmailCampaigns
  # Tracks permanent bounces reported by Mailgun, so the platform stops emailing
  # addresses that cannot receive mail. Repeated bounces hurt the sending
  # reputation and can get sending suspended.
  class EmailBounceService
    # Other permanent failures (unsubscribes, spam complaints, emails rejected
    # as spam) say nothing about whether the address exists.
    BOUNCE_REASONS = %w[bounce suppress-bounce].freeze

    # @param event_data [Hash] the `event-data` of a Mailgun webhook event
    def handle_mailgun_event(event_data)
      return unless bounce?(event_data)

      user = User.find_by_cimail(event_data[:recipient])
      # Mailgun can report the same address more than once; keep the first bounce.
      return if !user || user.email_bounced?

      bounce_reason = reason(event_data)
      # Skips validations: a user with unrelated invalid data must still stop
      # receiving emails.
      user.update_columns(email_bounced_at: Time.zone.now, email_bounce_reason: bounce_reason)
      LogActivityJob.perform_later(user, 'email_bounced', nil, Time.now.to_i, payload: { reason: bounce_reason })
    end

    private

    def bounce?(event_data)
      event_data[:event] == 'failed' &&
        event_data[:severity] == 'permanent' &&
        BOUNCE_REASONS.include?(event_data[:reason])
    end

    def reason(event_data)
      status = event_data[:'delivery-status'] || {}
      [status[:code], status[:description].presence || status[:message]].compact_blank.join(' ').presence
    end
  end
end
