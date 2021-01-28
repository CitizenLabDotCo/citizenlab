class IdeasPhase < ApplicationRecord
  belongs_to :idea
  belongs_to :phase
  counter_culture :phase, column_name: 'ideas_count'

  validates :idea, :phase, presence: true
  validates :phase_id, uniqueness: {scope: :idea_id}
  validate :idea_and_phase_same_project
  validate :phase_is_ideation


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

  def phase_is_ideation
    unless phase.can_contain_ideas?
      self.errors.add(
        :phase_id, 
        :phase_not_ideation, 
        message: 'You can\'t add an idea to a non-ideation phase'
      )
    end
  end
end
