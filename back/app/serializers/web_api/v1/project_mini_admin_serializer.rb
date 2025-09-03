# frozen_string_literal: true

class WebApi::V1::ProjectMiniAdminSerializer < WebApi::V1::BaseSerializer
  attributes(:title_multiloc, :visible_to, :listed)

  attribute :publication_status do |object|
    object.admin_publication.publication_status
  end

  attribute :first_published_at do |object|
    object.admin_publication.first_published_at
  end

  attribute :first_phase_start_date do |object|
    first_phase = object.phases.order(:start_at).first
    first_phase&.start_at
  end

  attribute :last_phase_end_date do |object|
    last_phase = object.phases.order(:start_at).last
    last_phase&.end_at
  end

  attribute :current_phase_start_date do |object|
    phase = TimelineService.new.current_phase(object)
    phase&.start_at
  end

  attribute :current_phase_end_date do |object|
    phase = TimelineService.new.current_phase(object)
    phase&.end_at
  end

  attribute :folder_title_multiloc do |object|
    object.folder&.title_multiloc
  end

  has_one :folder

  has_many :project_images, serializer: WebApi::V1::ImageSerializer

  has_many :phases, serializer: WebApi::V1::PhaseSerializer

  has_many :groups, serializer: WebApi::V1::GroupSerializer

  has_many :moderators, serializer: ::WebApi::V1::UserSerializer do |object, params|
    params.dig(:moderators_per_project, object.id) || []
  end
end
