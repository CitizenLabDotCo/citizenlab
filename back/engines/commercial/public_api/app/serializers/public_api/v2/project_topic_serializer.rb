# frozen_string_literal: true

module PublicApi
  module V2
    class ProjectTopicSerializer < PublicApi::V2::BaseSerializer
      type :project_topics

      attributes(
        :project_id,
        :created_at,
        :updated_at
      )

      attribute :topic_id do |serializer_instance|
        serializer_instance.object.global_topic_id
      end
    end
  end
end
