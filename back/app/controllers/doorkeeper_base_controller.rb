# frozen_string_literal: true

class DoorkeeperBaseController < ActionController::Base
  include AuthToken::Authenticable

  private

  # Doorkeeper endpoints are hit via top-level browser navigation, so the SPA's
  # fetcher (which copies cl2_jwt into the Authorization header) isn't in the
  # loop. Fall back to the cookie the browser sends automatically.
  def token
    super || cookies[:cl2_jwt]
  end
end
