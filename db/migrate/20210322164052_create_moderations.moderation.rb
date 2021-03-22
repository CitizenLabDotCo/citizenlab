# This migration comes from moderation (originally 20191209135917)
class CreateModerations < ActiveRecord::Migration[5.2]
  def change
    create_view :moderations
  end
end
