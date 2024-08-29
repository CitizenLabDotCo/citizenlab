# frozen_string_literal: true

module ImpactTracking
  class SideFxSessionService < BaseSideFxService
    def after_create(user)
      update_user_last_active_at(user)
    end

    # Called before setting the current session, to catch cases where upgrade returns a 404 when no visitor session
    # exists for the user. This can happen when a user logs out and in again without refreshing the page, for example.
    def before_set_current_session(user)
      update_user_last_active_at(user)
    end

    private

    def update_user_last_active_at(user)
      user&.update!(last_active_at: Time.zone.now)
    end
  end
end
