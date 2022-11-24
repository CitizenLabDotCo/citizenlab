# frozen_string_literal: true

module MultiTenancy
  module Patches
    module SideFxAppConfigurationService
      def after_update(app_config, current_user = nil)
        super
        MultiTenancy::TrackTenantJob.perform_later(Tenant.current)
      end

      def log_activity(app_config, action, user, payload = nil)
        super

        update_time = app_config.updated_at.to_i
        options = { payload: payload }.compact
        LogActivityJob.perform_later(app_config.tenant, action, user, update_time, options)
      end
    end
  end
end

SideFxAppConfigurationService.prepend(MultiTenancy::Patches::SideFxAppConfigurationService)
