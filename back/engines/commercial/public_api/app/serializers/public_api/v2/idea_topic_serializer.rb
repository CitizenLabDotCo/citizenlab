# frozen_string_literal: true

module PublicApi
  module V2
    class IdeaTopicSerializer < PublicApi::V2::BaseSerializer
      type :idea_topics
      attributes(:idea_id)
      attribute :topic_id do
        object.input_topic_id
      end
    end
  end
end
