# frozen_string_literal: true

# == Schema Information
#
# Table name: cosponsors_ideas
#
#  cosponsor_id :uuid
#  idea_id      :uuid
#
# Indexes
#
#  index_cosponsors_ideas_on_cosponsor_id  (cosponsor_id)
#  index_cosponsors_ideas_on_idea_id       (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (cosponsor_id => users.id)
#  fk_rails_...  (idea_id => ideas.id)
#
class CosponsorsIdea < ApplicationRecord
  belongs_to :idea
  belongs_to :cosponsor, class_name: 'User'

  validates :idea, :cosponsor, presence: true
  validates :cosponsor_id, uniqueness: { scope: :idea_id }
end
