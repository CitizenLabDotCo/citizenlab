# frozen_string_literal: true

# == Schema Information
#
# Table name: ideas_phases
#
#  id            :uuid             not null, primary key
#  idea_id       :uuid
#  phase_id      :uuid
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  baskets_count :integer          default(0), not null
#  votes_count   :integer          default(0), not null
#
# Indexes
#
#  index_ideas_phases_on_idea_id               (idea_id)
#  index_ideas_phases_on_idea_id_and_phase_id  (idea_id,phase_id) UNIQUE
#  index_ideas_phases_on_phase_id              (phase_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (phase_id => phases.id)
#
class IdeasPhase < ApplicationRecord
  belongs_to :idea, touch: true
  belongs_to :phase, touch: true
  counter_culture :phase, column_name: :ideas_count

  validates :idea, :phase, presence: true
  validates :phase_id, uniqueness: { scope: :idea_id }
  validate :idea_and_phase_same_project

  private

  def idea_and_phase_same_project
    return if idea.project_id == phase.project_id

    errors.add(
      :base,
      :idea_and_phase_not_same_project,
      message: 'The idea and the phase do not belong to the same project'
    )
  end
end
