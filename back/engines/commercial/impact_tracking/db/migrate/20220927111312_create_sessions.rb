# frozen_string_literal: true

class CreateSessions < ActiveRecord::Migration[6.1]
  def change
    create_table :impact_tracking_sessions, id: false do |t|
      t.string 'monthly_user_hash', null: false
      t.string 'highest_role'
      t.datetime 'created_at', null: false
    end
  end
end
