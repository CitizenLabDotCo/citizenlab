# frozen_string_literal: true

# == Schema Information
#
# Table name: ideas_input_topics
#
#  id             :uuid             not null, primary key
#  idea_id        :uuid             not null
#  input_topic_id :uuid             not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_ideas_input_topics_on_idea_id                     (idea_id)
#  index_ideas_input_topics_on_idea_id_and_input_topic_id  (idea_id,input_topic_id) UNIQUE
#  index_ideas_input_topics_on_input_topic_id              (input_topic_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (input_topic_id => input_topics.id)
#
class IdeasInputTopic < ApplicationRecord
  belongs_to :idea
  belongs_to :input_topic

  validates :input_topic_id, uniqueness: { scope: :idea_id }

  after_create :enfore_clean_topic_hierarchy

  private

  def enfore_clean_topic_hierarchy
    remove_parent_if_child_added
    remove_self_if_parent_of_existing_child_added
  end

  # When assigning an idea to a subtopic, remove the assignment to the parent topic
  def remove_parent_if_child_added
    parent_topic_id = input_topic.parent_id
    return if parent_topic_id.blank?

    IdeasInputTopic.where(idea_id: idea_id, input_topic_id: parent_topic_id).destroy_all
  end

  def remove_self_if_parent_of_existing_child_added
    child_topic_ids = input_topic.children.ids
    return if child_topic_ids.empty?

    if IdeasInputTopic.exists?(idea_id: idea_id, input_topic_id: child_topic_ids)
      delete
    end
  end
end
