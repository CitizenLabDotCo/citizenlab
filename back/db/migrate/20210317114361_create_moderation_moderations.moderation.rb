# This migration comes from moderation (originally 20210317093551)
class CreateModerationModerations < ActiveRecord::Migration[6.0]
  def change
    create_view :moderation_moderations
  end
end
