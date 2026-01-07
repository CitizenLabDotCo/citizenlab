# frozen_string_literal: true

module PublicApi
  module V2
    class ProjectTopicSerializer < PublicApi::V2::BaseSerializer
      type :project_topics

      attributes(
        :project_id,
        :global_topic_id,
        :created_at,
        :updated_at
      )
    end
  end
end
