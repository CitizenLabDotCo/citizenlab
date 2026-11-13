# frozen_string_literal: true

class AddReviewedSetupCardsToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :reviewed_setup_cards, :jsonb, default: [], null: false
  end
end
