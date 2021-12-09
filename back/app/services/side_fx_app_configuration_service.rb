# frozen_string_literal: true

class SideFxAppConfigurationService
  include SideFxHelper

  def before_create(app_config, current_user = nil) end

  def after_create(app_config, _ = nil)
    if app_config.homepage_info_multiloc
      app_config.update!(
        homepage_info_multiloc: TextImageService.new.swap_data_images(app_config, :homepage_info_multiloc)
      )
    end
  end

  def before_update(app_config, _ = nil)
    if app_config.homepage_info_multiloc
      app_config.homepage_info_multiloc = TextImageService.new.swap_data_images app_config, :homepage_info_multiloc
    end
  end

  def after_update(app_config, current_user = nil)
    log_activity(app_config, 'changed', current_user)
    if app_config.host_previously_changed?
      log_activity(app_config, 'changed_host', current_user, { changes: app_config.host_previous_change })
    end

    # TODO_MT to be removed after the lifecycle stage has been move to Tenant
    if (lifecycle_change = get_lifecycle_change(app_config))
      payload = { changes: lifecycle_change }
      log_activity(app_config, 'changed_lifecycle_stage', current_user, payload)
    end
  end

  private

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
  end
end

SideFxAppConfigurationService.prepend_if_ee('MultiTenancy::Patches::SideFxAppConfigurationService')
