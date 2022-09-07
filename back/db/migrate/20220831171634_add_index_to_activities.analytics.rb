# frozen_string_literal: true

# This migration comes from analytics (originally 20220831171337)

class AddIndexToActivities < ActiveRecord::Migration[6.1]
  def change
    add_index :activities, :action
  end
end
