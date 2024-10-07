# frozen_string_literal: true

class AddCosponsorshipToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_reference :notifications, :cosponsorship, foreign_key: true, type: :uuid, default: nil
  end
end
