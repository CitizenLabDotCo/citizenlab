# frozen_string_literal: true

class SurveysRenameParticipationContext < ActiveRecord::Migration[6.1]
  def change
    rename_column :surveys_responses, :participation_context_id, :phase_id
    remove_column :surveys_responses, :participation_context_type, :string
  end
end
