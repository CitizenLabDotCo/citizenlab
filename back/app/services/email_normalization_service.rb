# frozen_string_literal: true

class EmailNormalizationService
  # Providers that support plus-addressing (user+tag@domain.com)
  PLUS_ADDRESSING_DOMAINS = %w[
    gmail.com googlemail.com
    outlook.com hotmail.com live.com
    yahoo.com
    protonmail.com proton.me
  ].freeze

  # Gmail ignores dots in local part
  GMAIL_DOMAINS = %w[gmail.com googlemail.com].freeze

  # Be careful when changing this method. Removing a normalization rule could
  # potentially unban emails that were previously banned.
  def self.normalize(email)
    return '' if email.blank?

    local, domain = email.strip.downcase.split('@', 2)
    return email.strip.downcase unless domain

    local = local.delete('.') if GMAIL_DOMAINS.include?(domain)
    local = local.split('+').first if PLUS_ADDRESSING_DOMAINS.include?(domain)
    domain = 'gmail.com' if domain.in?(GMAIL_DOMAINS)

    "#{local}@#{domain}"
  end
end
