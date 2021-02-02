module MultiTenancy
  module SideFxAppConfigurationServiceDecorator

    def after_update(app_config, current_user)
      super
      TrackTenantJob.perform_later(tenant)
    end

  end
end

::SideFxAppConfigurationService.prepend(MultiTenancy::SideFxAppConfigurationServiceDecorator)