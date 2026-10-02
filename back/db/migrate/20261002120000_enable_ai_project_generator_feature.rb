# frozen_string_literal: true

# Prototype-only: turn the AI project generator on for existing tenants
# (including epic preview tenants, which persist across redeploys) so the
# real ?live generation can run end to end. Apartment invokes this once per
# tenant schema, so we only touch the current tenant's AppConfiguration.
class EnableAiProjectGeneratorFeature < ActiveRecord::Migration[7.1]
  def up
    return if Apartment::Tenant.current == 'public'

    config = AppConfiguration.instance
    return unless config

    settings = config.settings
    settings['ai_project_generator'] = { 'allowed' => true, 'enabled' => true }
    config.update!(settings: settings)
  end

  def down
    return if Apartment::Tenant.current == 'public'

    config = AppConfiguration.instance
    return unless config

    settings = config.settings
    settings['ai_project_generator'] = { 'allowed' => false, 'enabled' => false }
    config.update!(settings: settings)
  end
end
