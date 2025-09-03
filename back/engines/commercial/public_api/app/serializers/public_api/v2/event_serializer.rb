# frozen_string_literal: true

class PublicApi::V2::EventSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :project_id,
    :title,
    :description,
    :location,
    :location_point,
    :attendees_count,
    :maximum_attendees,
    :start_at,
    :end_at,
    :created_at,
    :updated_at

  multiloc_attributes(
    :title_multiloc,
    :description_multiloc,
    :location_multiloc
  )
end
