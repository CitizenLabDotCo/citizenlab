class AddCountryCodeToAppConfigurations < ActiveRecord::Migration[7.1]
  def change
    add_column :app_configurations, :country_code, :string
  end
end
