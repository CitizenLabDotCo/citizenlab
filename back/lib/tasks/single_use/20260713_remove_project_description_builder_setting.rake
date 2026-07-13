# frozen_string_literal: true

namespace :single_use do
  desc 'Remove the deprecated project_description_builder key from tenant settings'
  task remove_project_description_builder_setting: :environment do
    reporter = ScriptReporter.new

    Tenant.safe_switch_each do |tenant|
      config = AppConfiguration.instance
      next unless config.settings.key?('project_description_builder')

      config.update_column(:settings, config.settings.except('project_description_builder')) # rubocop:disable Rails/SkipsModelValidations
      reporter.add_change('present', 'removed', context: { tenant: tenant.host })
    end

    reporter.report!('remove_project_description_builder_setting.json', verbose: true)
  end
end
