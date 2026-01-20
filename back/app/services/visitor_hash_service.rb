# frozen_string_literal: true

class VisitorHashService
  # Generates a persistent hash for anonymous visitor identification.
  # Uses a persistent (non-rotating) salt to allow transferring all historical
  # anonymous exposures when a user logs in.

  def generate_for_request(request)
    generate_for_visitor(request.remote_ip, request.user_agent)
  end

  def generate_for_visitor(ip, user_agent)
    hash([salt, ip, user_agent].join('|'))
  end

  private

  def hash(str)
    Digest::SHA256.hexdigest(str)
  end

  def salt
    ENV.fetch('VISITOR_HASH_SALT') do
      raise 'VISITOR_HASH_SALT environment variable must be configured for anonymous user tracking'
    end
  end
end
