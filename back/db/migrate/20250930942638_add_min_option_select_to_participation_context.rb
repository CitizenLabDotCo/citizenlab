# frozen_string_literal: true

class AddMinOptionSelectToParticipationContext < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :voting_min_selected_options, :integer
  end
end
