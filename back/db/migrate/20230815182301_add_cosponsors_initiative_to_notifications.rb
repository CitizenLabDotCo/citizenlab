# frozen_string_literal: true

class AddCosponsorsInitiativeToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_column :notifications, :cosponsors_initiative_id, :uuid, null: true
    add_foreign_key :notifications, :cosponsors_initiatives, column: :cosponsors_initiative_id
    add_index :notifications, :cosponsors_initiative_id
  end
end
