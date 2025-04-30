class RemoveCountryCodeFromAppConfigurations < ActiveRecord::Migration[7.1]
  def change
    remove_column :app_configurations, :country_code, :string
  end
end
