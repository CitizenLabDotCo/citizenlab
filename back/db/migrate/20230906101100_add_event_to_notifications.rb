# frozen_string_literal: true

class AddEventToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_reference :notifications, :event, foreign_key: true, type: :uuid, default: nil
  end
end
