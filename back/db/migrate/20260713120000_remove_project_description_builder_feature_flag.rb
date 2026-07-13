# frozen_string_literal: true

# Removes the `project_description_builder` feature flag. The Content Builder for
# project and folder descriptions is now always on, so the flag's specification
# has been dropped from the schema. Its key is still present in stored tenant
# settings, and re-saving the whole hash would otherwise fail `additionalProperties`
# validation, so we strip it here via cleanup_settings (the same mechanism as the
# cl2back:clean_tenant_settings task), making the migration self-contained.
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
