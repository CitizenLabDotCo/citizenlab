# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class ViewSerializer < ::WebApi::V1::BaseSerializer
        attributes :name, :updated_at

        has_many(
          :data_sources,
          serializer: ::WebApi::V1::ProjectSerializer,
          record_type: :project
        ) { |view, _params| view.data_sources.includes(:origin).map(&:origin) }
      end
    end
  end
end
