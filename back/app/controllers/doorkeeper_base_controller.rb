# frozen_string_literal: true

# Doorkeeper renders HTML (authorization screens) and must not inherit the
# API-only, auth-enforcing ApplicationController, so we subclass ActionController::Base.
class DoorkeeperBaseController < ActionController::Base # rubocop:disable Rails/ApplicationController
  include AuthToken::Authenticable

  private

  # Doorkeeper endpoints are hit via top-level browser navigation, so the SPA's
  # fetcher (which copies cl2_jwt into the Authorization header) isn't in the
  # loop. Fall back to the cookie the browser sends automatically.
  def token
    super || cookies[:cl2_jwt]
  end
end
