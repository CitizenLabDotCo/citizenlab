# frozen_string_literal: true

module MultiTenancy
  module Patches
    module SideFxAppConfigurationService

      def after_update(app_config, current_user)
        super
        MultiTenancy::TrackTenantJob.perform_later(Tenant.current)
      end

    end
  end
end

SideFxAppConfigurationService.prepend(MultiTenancy::Patches::SideFxAppConfigurationService)
