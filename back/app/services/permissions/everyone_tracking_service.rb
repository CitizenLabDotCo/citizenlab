# frozen_string_literal: true

class Permissions::EveryoneTrackingService
  def initialize(user, phase, request)
    @user = user
    @phase = phase
    @request = request
  end

  # returns [user_agent_hash, author_hash] - author_hash will only be present if user was logged in when the cookie was set
  def author_hashes_from_request
    return unless enabled?

    # If no cookie values then we return a new hash
    tracking_cookie&.values || [logged_out_author_hash]
  end

  def submitted_without_tracking_consent?
    return false unless enabled?

    tracking_cookie == {} # If no consent the cookie will be present but with an empty value
  end

  def logged_out_author_hash
    return if @user # Author hash created in anonymous_participation.rb
    return unless enabled?

    # Get from the cookie and prefer the logged in author hash ['li'] if it exists
    author_hash = tracking_cookie ? tracking_cookie['li'] || tracking_cookie['lo'] : nil
    return author_hash if author_hash.present?

    # If nothing in the cookies then we create a new one
    author_hash = if !consent? && @request.ip && @request.user_agent
      # Create one based on the user agent and ip ONLY if no cookie consent
      Idea.create_author_hash(@request.ip + @request.user_agent, @phase.project_id, true)
    else
      Idea.create_author_hash(SecureRandom.uuid, @phase.project_id, true)
    end

    # Prefix author hash based on consent, so we can see the difference in stats
    consent? ? "y_#{author_hash}" : "n_#{author_hash}"
  end

  def write_everyone_tracking_cookie(response_cookies, author_hash)
    return unless enabled?

    if consent?
      # If user has consented then the cookie may contain 1 or 2 values
      # { lo: 'LOGGED_OUT_HASH', li: 'LOGGED_IN_HASH (author_hash)' }
      new_cookie = tracking_cookie || {}
      if @user
        new_cookie['li'] = author_hash
      else
        new_cookie['lo'] = author_hash
      end
      response_cookies[@phase.id] = { value: new_cookie, expires: 1.year.from_now }
    else
      # without consent we just set an empty value {} to indicate the user has taken the survey
      expiry = @phase.pmethod.allow_posting_again_after&.from_now || @phase.end_at || 1.year.from_now
      response_cookies[@phase.id] = { value: {}, expires: expiry }
    end
  end

  private

  def consent?
    consent_cookie = JSON.parse(@request.cookies['cl2_consent'] || 'null')
    consent_cookie&.dig('analytics') == true
  end

  def tracking_cookie
    JSON.parse(@request.cookies[@phase.id] || 'null')
  rescue JSON::ParserError
    {}
  end

  def enabled?
    @request && @phase&.pmethod&.everyone_tracking_enabled?
  end
end
