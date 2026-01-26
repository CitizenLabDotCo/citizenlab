# frozen_string_literal: true

class MigrateGtmContainerIdToArray < ActiveRecord::Migration[7.2]
  class AppConfiguration < ::ApplicationRecord
    self.table_name = 'app_configurations'

    def self.instance
      first
    end
  end

  def change
    app_config = AppConfiguration.instance
    return unless app_config

    settings = app_config.settings
    return unless settings['google_tag_manager']

    reversible do |dir|
      dir.up do
        if settings.dig('google_tag_manager', 'container_id').present?
          settings['google_tag_manager']['container_ids'] = [settings['google_tag_manager'].delete('container_id')]
          app_config.update!(settings: settings)
        end
      end

      dir.down do
        if settings.dig('google_tag_manager', 'container_ids').present?
          settings['google_tag_manager']['container_id'] = settings['google_tag_manager'].delete('container_ids').first
          app_config.update!(settings: settings)
        end
      end
    end
  end
end
