# frozen_string_literal: true

class AddUserAgentDataToSessions < ActiveRecord::Migration[7.0]
  def change
    add_column :impact_tracking_sessions, :referrer, :string, default: nil
    add_column :impact_tracking_sessions, :device_type, :string, default: nil
    add_column :impact_tracking_sessions, :browser_name, :string, default: nil
    add_column :impact_tracking_sessions, :os_name, :string, default: nil
  end
end
