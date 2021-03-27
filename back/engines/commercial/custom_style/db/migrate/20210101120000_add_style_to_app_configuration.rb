class AddStyleToAppConfiguration < ActiveRecord::Migration[6.0]
  def change
    add_column :app_configurations, :style, :jsonb, default: {}
  end
end
