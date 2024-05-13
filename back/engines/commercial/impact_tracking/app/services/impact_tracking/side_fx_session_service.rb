# frozen_string_literal: true

module ImpactTracking
  class SideFxSessionService < BaseSideFxService
    def after_create(user)
      update_user_last_active_at(user)
    end

    def after_upgrade(user)
      update_user_last_active_at(user)
    end

    private

    def update_user_last_active_at(user)
      user&.update!(last_active_at: Time.zone.now)
    end
  end
end
