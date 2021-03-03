# This migration comes from custom_style (originally 20210101120000)
class AddStyleToAppConfiguration < ActiveRecord::Migration[6.0]
  def change
    # Running it as an empty migration on existing deployments.
    # The comment will be removed afterwards.
    add_column :app_configurations, :style, :jsonb, default: {}
  end
end
