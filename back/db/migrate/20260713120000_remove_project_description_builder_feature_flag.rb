# frozen_string_literal: true

class RemoveProjectDescriptionBuilderFeatureFlag < ActiveRecord::Migration[7.2]
  def up
    return if Apartment::Tenant.current == 'public'

    config = AppConfiguration.instance
    return unless config

    settings = config.settings
    return unless settings.key?('project_description_builder')

    settings.delete('project_description_builder')
    config.settings = settings
    config.cleanup_settings
    config.save!
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
