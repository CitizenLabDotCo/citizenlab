# frozen_string_literal: true

class AddPhaseDateIndexes < ActiveRecord::Migration[5.1]
  def change
    add_index :phases, %i[start_at end_at]
  end
end
