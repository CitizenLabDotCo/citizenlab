# frozen_string_literal: true

class WebApi::V1::ProjectMiniSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :slug

  attribute :participation_status do |project|
    HighlightedPhaseService.new(project).participation_status
  end

  attribute :days_until_start do |project|
    HighlightedPhaseService.new(project).days_until_start
  end

  attribute :days_since_end do |project|
    HighlightedPhaseService.new(project).days_since_end
  end

  has_many :project_images, serializer: WebApi::V1::ImageSerializer

  has_one :highlighted_phase, serializer: WebApi::V1::PhaseMiniSerializer, record_type: :phase do |project|
    phase = HighlightedPhaseService.new(project).highlighted_phase
    phase.project = project if phase # Performance optimization (keep preloaded relationships)
    phase
  end
end
