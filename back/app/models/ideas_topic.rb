# frozen_string_literal: true

# == Schema Information
#
# Table name: ideas_topics
#
#  id       :uuid             not null, primary key
#  idea_id  :uuid
#  topic_id :uuid
#
# Indexes
#
#  index_ideas_topics_on_idea_id               (idea_id)
#  index_ideas_topics_on_idea_id_and_topic_id  (idea_id,topic_id) UNIQUE
#  index_ideas_topics_on_topic_id              (topic_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (topic_id => global_topics.id)
#
class IdeasTopic < ApplicationRecord
  belongs_to :idea
  # NOTE: column is still topic_id but references GlobalTopic (renamed from Topic)
  belongs_to :topic, class_name: 'GlobalTopic', inverse_of: :ideas_topics

  validates :idea, :topic, presence: true
  validates :topic_id, uniqueness: { scope: :idea_id }
end
