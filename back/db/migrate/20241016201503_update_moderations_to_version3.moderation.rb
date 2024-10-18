# frozen_string_literal: true

# This migration comes from moderation (originally 20241016201301)
class UpdateModerationsToVersion3 < ActiveRecord::Migration[7.0]
  def change
    update_view :moderation_moderations, version: 3, revert_to_version: 2
  end
end
