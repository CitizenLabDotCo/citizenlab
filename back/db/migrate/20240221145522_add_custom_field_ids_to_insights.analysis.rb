# This migration comes from analysis (originally 20240221144917)
class AddCustomFieldIdsToInsights < ActiveRecord::Migration[7.0]
  def change
    add_column :analysis_insights, :custom_field_ids, :jsonb, default: {}, null: false
  end
end
