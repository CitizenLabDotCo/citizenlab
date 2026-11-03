# frozen_string_literal: true

class WebApi::V1::ProjectMiniAdminSerializer < WebApi::V1::BaseSerializer
  attributes(:title_multiloc, :visible_to, :listed)

  attribute :publication_status do |object|
    object.admin_publication.effective_publication_status
  end

  attribute :first_published_at do |object|
    object.admin_publication.first_published_at
  end

  attribute :scheduled_at do |object|
    admin_pub = object.admin_publication
    admin_pub.scheduled_at unless admin_pub.due_status_transition?
  end

  attribute :first_phase_start_date do |object|
    object.schedule.phases_span&.first
  end

  attribute :last_phase_end_date do |object|
    object.schedule.phases_span&.last
  end

  attribute :active_phases_start_date do |object|
    object.schedule.active_span&.first
  end

  attribute :active_phases_end_date do |object|
    object.schedule.active_span&.last
  end

  attribute :folder_title_multiloc do |object|
    object.folder&.title_multiloc
  end

  attribute :space_title_multiloc do |object|
    object.space&.title_multiloc
  end

  has_one :folder

  has_one :space

  has_many :project_images, serializer: WebApi::V1::ImageSerializer

  has_many :phases, serializer: WebApi::V1::PhaseSerializer

  has_many :groups, serializer: WebApi::V1::GroupSerializer

  has_many :moderators, serializer: ::WebApi::V1::UserSerializer do |object, params|
    params.dig(:moderators_per_project, object.id) || []
  end
end
