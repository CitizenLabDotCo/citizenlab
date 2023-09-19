# frozen_string_literal: true

class AddAttendeesCountToEvents < ActiveRecord::Migration[7.0]
  def change
    add_column :events, :attendees_count, :integer, null: false, default: 0
  end
end
