# frozen_string_literal: true

# This migration comes from analytics (originally 20261027120000)
class AddItemTypeAndActionIndexToActivities < ActiveRecord::Migration[7.2]
  # The reporting views pick activities by item type and action. Without this
  # index, Postgres intersects the item type and action indexes for each pair,
  # reading hundreds of thousands of entries to find a few hundred rows: over
  # 10 seconds on the largest tenant when not cached.
  def change
    add_index :activities, %i[item_type action]
  end
end
