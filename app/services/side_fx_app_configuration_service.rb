class SideFxAppConfigurationService

  include SideFxHelper

  def before_update(app_config, current_user); end

  def after_update(app_config, current_user)
    update_time = app_config.updated_at.to_i
    LogActivityJob.perform_later(app_config, 'changed', current_user, update_time)

    if app_config.host_previously_changed?
      payload = {changes: app_config.host_previous_change}
      LogActivityJob.perform_later(app_config, 'changed_host', current_user, update_time, payload: payload)
    end

    if ( lifecycle_change = get_lifecycle_change(app_config) )
      payload = {changes: lifecycle_change}
      LogActivityJob.perform_later(app_config, 'changed_lifecycle_stage', current_user, update_time, payload: payload)
    end

    update_group_by_identify
  end

  private

  def update_group_by_identify
    user = User.admin.first || User.first
    TrackTenantJob.perform_later(user) if user
  end

  # @param  [AppConfiguration] app_config
  # @return [nil,Array(String,String)] An array of two strings if the lifecycle changed. Otherwise, nil.
  def get_lifecycle_change(app_config)
    return unless app_config.settings_previously_changed?
    old_settings = app_config.settings_previous_change[0]
    new_settings = app_config.settings

    diff = [old_settings, new_settings].map{|s| s&.dig('core', 'lifecycle_stage')}
    diff[0] != diff[1] ? diff : nil
  end

end
