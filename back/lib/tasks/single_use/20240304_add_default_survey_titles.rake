# frozen_string_literal: true

namespace :single_use do
  task add_default_survey_titles: :environment do |_t, _args|
    Tenant.switch_each do |tenant|
      app_config = AppConfiguration.instance

      survey_title = MultilocService.new.i18n_to_multiloc(
        'phases.native_survey_title',
        locales: app_config.settings('core', 'locales')
      )
      survey_button = MultilocService.new.i18n_to_multiloc(
        'phases.native_survey_button',
        locales: app_config.settings('core', 'locales')
      )

      records_updated = Phase.where(participation_method: 'native_survey').update_all(
        native_survey_title_multiloc: survey_title,
        native_survey_button_multiloc: survey_button
      )
      Rails.logger.info "#{tenant.host} - Updated #{records_updated} survey phases."
    end
  end
end
