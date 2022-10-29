# frozen_string_literal: true

class RemoveHeaderBgAndHomepageInfoMultilocFromAppConfigurations < ActiveRecord::Migration[6.1]
  def change
    remove_column :app_configurations, :header_bg, :string
    remove_column :app_configurations, :homepage_info_multiloc, :jsonb
  end
end
