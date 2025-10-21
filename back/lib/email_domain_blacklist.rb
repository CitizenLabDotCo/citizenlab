# This module loads and combines blacklisted email domains from multiple sources.
# It reads from config/our_domain_blacklist.txt and config/common_spam_domains.txt,
# strips whitespace, downcases, and returns a frozen array.

# our_domain_blacklist.txt is curated by us and can be edited as needed.
# common_spam_domains.txt was copied on 29-09-2025, from:
# https://github.com/disposable-email-domains/disposable-email-domains/blob/main/disposable_email_blocklist.conf

module EmailDomainBlacklist
  # yopmail.com is allowed, because FC uses it for test users, despite being a common spam domain.
  WHITELISTED_DOMAINS = %w[yopmail.com].freeze

  def self.load
    domains = []
    domains += Rails.root.join('config/our_domain_blacklist.txt').readlines.map { |x| x.strip.downcase }
    domains += Rails.root.join('config/common_spam_domains.txt').readlines.map { |x| x.strip.downcase }
    domains -= WHITELISTED_DOMAINS
    domains.uniq.freeze
  end
end
