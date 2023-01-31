# frozen_string_literal: true

# This migration comes from impact_tracking (originally 20230131110900)

class AddUserIdToSessions < ActiveRecord::Migration[6.1]
  def change
    add_column :impact_tracking_sessions, :user_id, :uuid
  end
end
