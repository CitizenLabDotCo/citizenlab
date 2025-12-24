class AddPlatformStartAtToAppConfigurations < ActiveRecord::Migration[7.2]
  def change
    add_column :app_configurations, :override_platform_start_at, :datetime
  end
end
