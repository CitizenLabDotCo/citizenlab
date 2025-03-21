# frozen_string_literal: true

class Permissions::EveryoneTrackingService
  def initialize(request, user, phase)
    @request = request
    @user = user
    @phase = phase
  end

  # returns [user_agent_hash, author_hash] - author_hash will only be present if user was logged in when the cookie was set
  def tracking_hashes_from_headers
    return unless @request && @phase&.pmethod&.supports_everyone_tracking?

    cookie_hashes = @request.cookies[@phase.id]
    tracking_hashes = []

    # TODO: If cookies are allowed then we can set the author hash to anything

    # If true then reject - if contains hashes then check ideas
    # If no cookie then just create an author hash from the user agent and ip - but do we still check it?

    if cookie_hashes.present?
      tracking_hashes = cookie_hashes.split(',')
    elsif @request.ip && @request.user_agent
      tracking_hashes = [Idea.create_author_hash(@request.ip + @request.user_agent, @phase.project_id, true)]
    end

    tracking_hashes

    # TODO: JS - If user logged in then check the last browser_hash is them, if not then replace it - someone else has obviously used the same machine
  end
end
