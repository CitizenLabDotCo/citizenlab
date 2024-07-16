# frozen_string_literal: true

# This migration comes from volunteering (originally 20231123173011)
class VolunteeringRenameParticipationContext < ActiveRecord::Migration[6.1]
  def change
    rename_column :volunteering_causes, :participation_context_id, :phase_id
    remove_column :volunteering_causes, :participation_context_type, :string
  end
end
