# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class ReportSerializer < ::WebApi::V1::BaseSerializer
        attributes :name, :updated_at

        has_one(
          :layout,
          record_type: ContentBuilder::WebApi::V1::LayoutSerializer.record_type,
          serializer: ContentBuilder::WebApi::V1::LayoutSerializer
        )
      end
    end
  end
end
