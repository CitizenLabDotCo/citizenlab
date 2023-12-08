# frozen_string_literal: true

class AddParticipationMethodToIdea < ActiveRecord::Migration[7.0]
  def up
    add_column :ideas, :participation_method, :string, after: :creation_phase_id, default: 'ideation', null: false

    # Update the data of all ideas
    Idea.all.each do |idea|
      if idea.creation_phase_id.blank?
        phase =
          idea.phases.find(&:can_contain_ideas?) ||
          TimelineService.new.current_or_last_can_contain_ideas_phase(idea.project)
        idea.update!(creation_phase: phase, participation_method: 'ideation')
      else
        idea.update!(participation_method: 'native_survey')
      end
    end
  end

  def down
    Idea.where(participation_method: 'ideation').update_all(creation_phase_id: nil)
    remove_column :ideas, :participation_method
  end
end
