# == Schema Information
#
# Table name: idea_exposures
#
#  id                                                                                                                :uuid             not null, primary key
#  user_id                                                                                                           :uuid
#  idea_id                                                                                                           :uuid             not null
#  phase_id(This is the phase during which the idea is exposed to the user, stored redundantly for faster querying.) :uuid             not null
#  created_at                                                                                                        :datetime         not null
#  updated_at                                                                                                        :datetime         not null
#  visitor_hash                                                                                                      :string
#
# Indexes
#
#  index_idea_exposures_on_idea_id       (idea_id)
#  index_idea_exposures_on_phase_id      (phase_id)
#  index_idea_exposures_on_user_id       (user_id)
#  index_idea_exposures_on_visitor_hash  (visitor_hash)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (phase_id => phases.id)
#  fk_rails_...  (user_id => users.id)
#
class IdeaExposure < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :idea
  belongs_to :phase

  validate :user_xor_visitor_hash

  private

  def user_xor_visitor_hash
    unless user_id.present? ^ visitor_hash.present?
      errors.add(:base, :user_and_visitor_hash_both_present_or_unpresent)
    end
  end
end
