# frozen_string_literal: true

class UpgradePostgisExtension < ActiveRecord::Migration[7.0]
  def change
    return unless Apartment::Tenant.current == 'public'

    ActiveRecord::Base.connection.execute('SELECT shared_extensions.postgis_extensions_upgrade();')
  end
end
