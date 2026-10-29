# frozen_string_literal: true

class WebApi::V1::ProjectAdminSearchSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc

  attribute :folder_id do |object|
    object.folder&.id
  end

  attribute :folder_title_multiloc do |object|
    object.folder&.title_multiloc
  end

  # Only what search shows, rather than full phase records.
  attribute :phases do |object|
    object.phases.map { |phase| { id: phase.id, title_multiloc: phase.title_multiloc } }
  end
end
