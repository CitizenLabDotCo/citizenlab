# frozen_string_literal: true

class AddParticipationMethodToIdea < ActiveRecord::Migration[7.0]
  def change
    add_column :ideas, :participation_method, :string, after: :creation_phase_id, default: 'ideation', null: false
    Idea.where.not(creation_phase: nil).update_all(participation_method: 'native_survey')
  end
end
