# frozen_string_literal: true

class AddAllowAnonymousPostingToParticipationContext < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :allow_anonymous_posting, :boolean, null: false, default: false
    add_column :phases, :allow_anonymous_posting, :boolean, null: false, default: false
  end
end
