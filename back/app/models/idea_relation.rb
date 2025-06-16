# frozen_string_literal: true

# == Schema Information
#
# Table name: idea_relations
#
#  id              :uuid             not null, primary key
#  idea_id         :uuid             not null
#  related_idea_id :uuid             not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_idea_relations_on_idea_id                      (idea_id)
#  index_idea_relations_on_idea_id_and_related_idea_id  (idea_id,related_idea_id) UNIQUE
#  index_idea_relations_on_related_idea_id              (related_idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (related_idea_id => ideas.id)
#

# IdeaRelation represents a relationship between two ideas.
#
# Currently, being "related" implicitly means that the +idea+ is a *copy* or
# *clone* of the +related_idea+.
#
# In the future, we may add an explicit +relationship+ attribute (or similar) to this
# model to support different types of relationships between ideas, such as:
# "copy", "clone", "duplicate", "generated_from" (e.g., AI-generated), etc.
class IdeaRelation < ApplicationRecord
  belongs_to :idea
  belongs_to :related_idea, class_name: 'Idea'

  validates :idea, :related_idea, presence: true
  validates :related_idea_id, uniqueness: { scope: :idea_id }
  validate :cannot_relate_to_self

  private

  def cannot_relate_to_self
    return unless idea_id == related_idea_id

    errors.add(:related_idea, :cannot_relate_to_self, message: 'An idea cannot be related to itself')
  end
end
