class IdeasPhase < ApplicationRecord
  belongs_to :idea, touch: true
  belongs_to :phase, touch: true
  counter_culture :phase, column_name: :ideas_count

  validates :idea, :phase, presence: true
  validates :phase_id, uniqueness: {scope: :idea_id}
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
