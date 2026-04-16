# frozen_string_literal: true

class AddDraftDescriptionMultilocToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :draft_description_multiloc, :jsonb, default: {}, null: false
  end
end
