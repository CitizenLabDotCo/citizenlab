# frozen_string_literal: true

module Facets
  class IdeaInputTopic
    # The topics an idea counts under: its tags and the parents of its tags.
    PAIRS = <<~SQL.squish
      SELECT idea_id, input_topic_id AS topic_id FROM ideas_input_topics
      UNION
      SELECT ideas_input_topics.idea_id, input_topics.parent_id AS topic_id
      FROM ideas_input_topics
      JOIN input_topics ON input_topics.id = ideas_input_topics.input_topic_id
      WHERE input_topics.parent_id IS NOT NULL
    SQL

    def key = 'input_topic_id'

    def counts(ideas)
      IdeasInputTopic
        .from("(#{PAIRS}) AS ideas_input_topics")
        .where(idea_id: ideas.select(:id))
        .group(:topic_id)
        .count(:idea_id)
    end
  end
end
