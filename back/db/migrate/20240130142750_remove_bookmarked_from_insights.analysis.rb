# This migration comes from analysis (originally 20240130142750)
class RemoveBookmarkedFromInsights < ActiveRecord::Migration[7.0]
  def change
    remove_column :analysis_insights, :bookmarked
  end
end
