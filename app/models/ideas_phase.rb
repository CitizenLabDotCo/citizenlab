class IdeasPhase < ApplicationRecord
  belongs_to :idea
  belongs_to :phase

  validates :idea, :phase, presence: true
  validate :idea_and_phase_same_project

  private 
    def idea_and_phase_same_project
      unless idea.project_id == phase.project_id
        self.errors.add(
          :base, 
          :idea_and_phase_not_same_project, 
          message: 'The idea and the phase do not belong to the same project'
        )
      end
    end
end
