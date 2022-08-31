# frozen_string_literal: true

class AddIndexToActivities < ActiveRecord::Migration[6.1]
  def change
    add_index :activities, :action
  end
end
