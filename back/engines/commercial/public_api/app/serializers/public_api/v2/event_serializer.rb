# frozen_string_literal: true

class PublicApi::V2::EventSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :project_id,
    :title,
    :description,
    :location,
    :location_point,
    :attendees_count,
    :start_at,
    :end_at,
    :created_at,
    :updated_at

  def title
    multiloc_service.t(object.title_multiloc)
  end

  def description
    multiloc_service.t(object.description_multiloc)
  end

  def location
    multiloc_service.t(object.location_multiloc)
  end
end
