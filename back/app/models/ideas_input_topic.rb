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
end
