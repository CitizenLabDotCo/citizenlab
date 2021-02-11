class AddStyleToAppConfiguration < ActiveRecord::Migration[5.2]
  def change
    add_column :app_configurations, :style, :jsonb, default: {}
  end
end
