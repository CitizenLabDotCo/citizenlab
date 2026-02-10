# frozen_string_literal: true

module PublicApi
  module V2
    class IdeasInputTopicSerializer < PublicApi::V2::BaseSerializer
      type :ideas_input_topics
      attributes(:idea_id, :input_topic_id)
    end
  end
end
