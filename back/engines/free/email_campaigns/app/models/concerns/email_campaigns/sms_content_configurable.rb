# frozen_string_literal: true

module EmailCampaigns
  # SMS counterpart of ContentConfigurable: a plain-text message body, no subject,
  # no HTML, no editable regions. Reuses the existing body_multiloc column.
  module SmsContentConfigurable
    extend ActiveSupport::Concern

    # Generous upper bound; a single SMS segment is 160 chars (70 for unicode),
    # longer messages are split into multiple billed segments. We warn in the UI
    # rather than hard-fail at the segment boundary, but cap absolute length.
    MAX_LENGTH = 1600

    included do
      validates :body_multiloc, presence: true, multiloc: { presence: true }
      validate :body_multiloc_within_length
    end

    # Plain-text message for a given locale.
    def sms_body(locale)
      MultilocService.new.t(body_multiloc, locale)
    end

    private

    def body_multiloc_within_length
      return if body_multiloc.blank?

      body_multiloc.each do |locale, value|
        next if value.to_s.length <= MAX_LENGTH

        errors.add(:body_multiloc, :too_long, message: "is too long for locale '#{locale}' (max #{MAX_LENGTH} characters)")
      end
    end
  end
end
