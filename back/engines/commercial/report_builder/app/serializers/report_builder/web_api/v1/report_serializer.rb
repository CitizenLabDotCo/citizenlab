# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class ReportSerializer < ::WebApi::V1::BaseSerializer
        attributes :name, :created_at, :updated_at, :visible, :year, :quarter

        attribute :action_descriptors do |object, params|
          @permissions_service = ReportBuilder::Permissions::ReportPermissionsService.new
          @permissions_service.action_descriptors(object, current_user(params))
        end

        has_one(
          :layout,
          record_type: ContentBuilder::WebApi::V1::LayoutSerializer.record_type,
          serializer: ContentBuilder::WebApi::V1::LayoutSerializer
        )

        has_one(
          :phase,
          record_type: ::WebApi::V1::PhaseSerializer.record_type,
          serializer: ::WebApi::V1::PhaseSerializer
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
