# frozen_string_literal: true

# This migration comes from impact_tracking (originally 20240927175400)

class AddUserAgentDataToSessions < ActiveRecord::Migration[7.0]
  def change
    add_column :impact_tracking_sessions, :referrer, :string, default: nil
    add_column :impact_tracking_sessions, :device_type, :string, default: nil
    add_column :impact_tracking_sessions, :browser_name, :string, default: nil
    add_column :impact_tracking_sessions, :browser_version, :string, default: nil
    add_column :impact_tracking_sessions, :os_name, :string, default: nil
    add_column :impact_tracking_sessions, :os_version, :string, default: nil
    add_column :impact_tracking_sessions, :entry_path, :string, default: nil
    add_column :impact_tracking_sessions, :entry_route, :string, default: nil
    add_column :impact_tracking_sessions, :entry_locale, :string, default: nil
  end
end
