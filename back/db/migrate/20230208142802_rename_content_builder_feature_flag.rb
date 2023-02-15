# frozen_string_literal: true

class RenameContentBuilderFeatureFlag < ActiveRecord::Migration[6.1]
  class AppConfiguration < ::ApplicationRecord
    self.table_name = 'app_configurations'
  end

  def change
    app_config = AppConfiguration.first
    return unless app_config

    settings = app_config.settings

    reversible do |dir|
      dir.up do
        settings['project_description_builder'] = settings.delete('content_builder')
        app_config.update!(settings: settings)
      end

      dir.down do
        settings['content_builder'] = settings.delete('project_description_builder')
        app_config.update!(settings: settings)
      end
    end
  end
end
