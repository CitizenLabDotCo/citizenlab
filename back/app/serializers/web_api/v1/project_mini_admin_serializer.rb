# frozen_string_literal: true

class WebApi::V1::ProjectMiniAdminSerializer < WebApi::V1::BaseSerializer
  attributes(:title_multiloc)

  has_one :current_phase, serializer: WebApi::V1::PhaseMiniSerializer, record_type: :phase do |object|
    TimelineService.new.current_phase(object)
  end
end
