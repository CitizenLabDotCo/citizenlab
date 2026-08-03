# frozen_string_literal: true

class AddStartedAtToInvitesImports < ActiveRecord::Migration[7.2]
  def change
    # Set when the background job begins. Lets the front-end tell "the queue has
    # not picked this up yet" apart from "the job is running and taking a while",
    # which need very different waiting times before an error is shown.
    add_column :invites_imports, :started_at, :datetime
  end
end
