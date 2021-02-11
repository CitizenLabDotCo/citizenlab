# This migration comes from custom_style (originally 20210101120000)
class AddStyleToAppConfiguration < ActiveRecord::Migration[5.2]
  def change
    add_column :app_configurations, :style, :jsonb, default: {}
  end
end
