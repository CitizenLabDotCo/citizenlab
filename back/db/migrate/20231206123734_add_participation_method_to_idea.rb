# frozen_string_literal: true

class AddParticipationMethodToIdea < ActiveRecord::Migration[7.0]
  def change
    add_column :ideas, :participation_method, :string, after: :creation_phase_id, default: 'ideation', null: false

    # Tag existing native surveys
    Idea.where.not(creation_phase: nil).update_all(participation_method: 'native_survey')

    # Add the creation_phase_id to the rest of the ideas
    Idea.where(creation_phase: nil).each do |idea|
      phase =
        idea.phases.find(&:can_contain_ideas?) ||
        TimelineService.new.current_or_last_can_contain_ideas_phase(idea.project)
      idea.update!(creation_phase: phase, participation_method: 'ideation')
    end
  end
end
