# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class ReportSerializer < ::WebApi::V1::BaseSerializer
        attributes :name, :created_at, :updated_at

        has_one(
          :layout,
          record_type: ContentBuilder::WebApi::V1::LayoutSerializer.record_type,
          serializer: ContentBuilder::WebApi::V1::LayoutSerializer
        )

        belongs_to(
          :owner,
          record_type: ::WebApi::V1::UserSerializer.record_type,
          serializer: ::WebApi::V1::UserSerializer
        )
      end
    end
  end
end
