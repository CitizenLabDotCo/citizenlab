class RemoveBookmarkedFromInsights < ActiveRecord::Migration[7.0]
  def change
    remove_column :analysis_insights, :bookmarked
  end
end
