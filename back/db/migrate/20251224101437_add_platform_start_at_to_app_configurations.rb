class AddPlatformStartAtToAppConfigurations < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      add_column :app_configurations, :platform_start_at, :datetime, default: -> { 'NOW()' }, null: false

      # Backfill platform_start_at with created_at for existing platforms
      reversible do |dir|
        dir.up do
          execute <<-SQL.squish
          UPDATE app_configurations
          SET platform_start_at = created_at
          SQL
        end
      end
    end
  end
end
