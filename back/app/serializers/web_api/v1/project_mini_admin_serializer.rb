# frozen_string_literal: true

class WebApi::V1::ProjectMiniAdminSerializer < WebApi::V1::BaseSerializer
  attributes(:title_multiloc, :visible_to)

  attribute :publication_status do |object|
    object.admin_publication.publication_status
  end

  attribute :first_phase_start_date do |object|
    first_phase = object.phases.order(:start_at).first
    first_phase&.start_at
  end

  attribute :last_phase_end_date do |object|
    last_phase = object.phases.order(:start_at).last
    last_phase&.end_at
  end

  attribute :folder_title_multiloc do |object|
    object.folder&.title_multiloc
  end

  has_one :current_phase, serializer: WebApi::V1::PhaseMiniSerializer, record_type: :phase do |object|
    TimelineService.new.current_phase(object)
  end

  has_one :folder
end
