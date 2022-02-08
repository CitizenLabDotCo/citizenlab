# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class ViewSerializer < ::WebApi::V1::BaseSerializer
        attributes :name, :updated_at

        belongs_to(
          :scope,
          serializer: ::WebApi::V1::ProjectSerializer,
          record_type: :project
        ) { |view, _params| view.scope }
      end
    end
  end
end
