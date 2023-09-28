# frozen_string_literal: true

# This migration comes from analysis (originally 202307271503)
class AddBookmarkedToInsights < ActiveRecord::Migration[7.0]
  def change
    add_column :analysis_insights, :bookmarked, :boolean, default: false
  end
end
