# frozen_string_literal: true

class AddUserIdToSessions < ActiveRecord::Migration[6.1]
    def change
      add_column :impact_tracking_sessions, :user_id, :uuid
    end
end