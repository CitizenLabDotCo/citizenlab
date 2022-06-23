# frozen_string_literal: true

class CreateModerations < ActiveRecord::Migration[5.2]
  def change
    create_view :moderations
  end
end
