class DropModerations < ActiveRecord::Migration[6.0]
  def change
    drop_view :moderations
  end
end
