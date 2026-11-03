# frozen_string_literal: true

class WebApi::V1::ProjectMiniSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :slug

  attribute :participation_status do |project|
    project.schedule.participation_status
  end

  attribute :days_until_start do |project|
    project.schedule.days_until_start
  end

  attribute :days_since_end do |project|
    project.schedule.days_since_end
  end

  has_many :project_images, serializer: WebApi::V1::ImageSerializer

  has_one :highlighted_phase, serializer: WebApi::V1::PhaseMiniSerializer, record_type: :phase do |project|
    phase = project.schedule.highlighted_phase
    phase.project = project if phase # Performance optimization (keep preloaded relationships)
    phase
  end
end
