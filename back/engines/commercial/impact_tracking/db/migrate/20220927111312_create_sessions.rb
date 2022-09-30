# frozen_string_literal: true

class CreateSessions < ActiveRecord::Migration[6.1]
  def change
    create_table :impact_tracking_sessions, id: :uuid do |t|
      t.string 'monthly_user_hash', null: false, index: true
      t.string 'highest_role'
      t.timestamps
    end
  end
end
