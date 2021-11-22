class AddHomepageInfoMultilocToAppConfigurations < ActiveRecord::Migration[6.1]
  def change
    add_column :app_configurations, :homepage_info_multiloc, :jsonb
    # TODO
    # has homepage-info?
    # associate all textimages to app config instead of page (for body-multiloc -- delete others)
    # delete homepage-info
    # ActiveRecord::Base.connection.execute ''
  end
end
