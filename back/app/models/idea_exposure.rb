# == Schema Information
#
# Table name: idea_exposures
#
#  id         :uuid             not null, primary key
#  user_id    :uuid             not null
#  idea_id    :uuid             not null
#  phase_id   :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_idea_exposures_on_idea_id   (idea_id)
#  index_idea_exposures_on_phase_id  (phase_id)
#  index_idea_exposures_on_user_id   (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (phase_id => phases.id)
#  fk_rails_...  (user_id => users.id)
#
# An IdeaExposure represents the user seeing an idea in the ideation feed
class IdeaExposure < ApplicationRecord
  belongs_to :user
  belongs_to :idea
  belongs_to :phase
end
