# frozen_string_literal: true

class SideFxAppConfigurationService
  include SideFxHelper

  def before_create(app_config, current_user = nil) end

  def after_create(app_config, current_user = nil) end

  def before_update(app_config, current_user = nil) end

  def after_update(app_config, current_user = nil)
    log_activity(app_config, 'changed', current_user)
    log_activity(app_config, 'changed_host', current_user) if app_config.host_previously_changed?

    if (lifecycle_change = get_lifecycle_change(app_config))
      payload = { changes: lifecycle_change }
      log_activity(app_config, 'changed_lifecycle_stage', current_user, payload)
    end

    track_tenant_async(Tenant.current)
  end

  private

  # @param [Tenant] tenant
  def track_tenant_async(tenant)
    TrackTenantJob.perform_later(tenant)
  end

  # @param  [AppConfiguration] app_config
  # @return [nil,Array(String,String)] An array of two strings if the lifecycle changed. Otherwise, nil.
  def get_lifecycle_change(app_config)
    return unless app_config.settings_previously_changed?
    old_settings = app_config.settings_previous_change[0]
    new_settings = app_config.settings

    diff = [old_settings, new_settings].map { |s| s&.dig('core', 'lifecycle_stage') }
    diff[0] != diff[1] ? diff : nil
  end

  # @param [AppConfiguration] app_config
  # @param [String] action
  # @param [User, nil] user
  # @param [Hash, nil] payload
  def log_activity(app_config, action, user, payload = nil)
    update_time = app_config.updated_at.to_i
    options = { payload: payload }.compact

    LogActivityJob.perform_later(app_config, action, user, update_time, options)
    LogActivityJob.perform_later(app_config.tenant, action, user, update_time, options) # MT_TODO To be removed once event subscribers have benn adapted.
  end
end
