# frozen_string_literal: true

class AddPollAnonymousToParticipationContext < ActiveRecord::Migration[5.1]
  def change
    add_column :projects, :poll_anonymous, :boolean, null: false, default: false
    add_column :phases,   :poll_anonymous, :boolean, null: false, default: false
  end
end
