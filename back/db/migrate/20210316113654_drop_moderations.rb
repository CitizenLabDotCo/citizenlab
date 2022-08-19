# frozen_string_literal: true

class DropModerations < ActiveRecord::Migration[6.0]
  def change
    drop_view :moderations
  end
end
