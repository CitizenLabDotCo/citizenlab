# frozen_string_literal: true

class EnableDisableDislikingFeature < ActiveRecord::Migration[7.0]
  def change
    # Change the default value of 'reacting_dislike_enabled' on phase to 'false'
    change_column_default :phases, :reacting_dislike_enabled, from: true, to: false

    return if Apartment::Tenant.current == 'public'

    # Enable and allow 'disable disliking' feature for all tenants
    settings = AppConfiguration.instance.settings
    settings['disable_disliking'] = { 'allowed' => true, 'enabled' => true }
    AppConfiguration.instance.update! settings: settings
  end
end
