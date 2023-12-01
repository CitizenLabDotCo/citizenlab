# frozen_string_literal: true

class BasketRenameParticipationContext < ActiveRecord::Migration[6.1]
  def change
    rename_column :baskets, :participation_context_id, :phase_id
    remove_column :baskets, :participation_context_type, :string
  end
end
