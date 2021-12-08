class AddHomepageInfoMultilocToAppConfigurations < ActiveRecord::Migration[6.1]
  def change
    add_column :app_configurations, :homepage_info_multiloc, :jsonb
  end
end
