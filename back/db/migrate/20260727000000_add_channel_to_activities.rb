# frozen_string_literal: true

class AddChannelToActivities < ActiveRecord::Migration[7.2]
  def change
    # Activity origin: 'mcp' for the MCP server, nil for the web/API path.
    add_column :activities, :channel, :string
  end
end
