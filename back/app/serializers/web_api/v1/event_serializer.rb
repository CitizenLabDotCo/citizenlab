# frozen_string_literal: true

class WebApi::V1::EventSerializer < WebApi::V1::BaseSerializer
  attributes(
    :title_multiloc,
    :location_multiloc,
    :online_link,
    :address_1,
    :address_2_multiloc,
    :location_point_geojson,
    :attendees_count,
    :start_at,
    :end_at,
    :created_at,
    :updated_at
  )

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  belongs_to :project

  belongs_to(
    :user_attendance,
    record_type: WebApi::V1::Events::AttendanceSerializer.record_type,
    serializer: WebApi::V1::Events::AttendanceSerializer
  ) do |event, params|
    # +:current_user_attendances+ param is used with collections to avoid N+1 queries
    if (attendances = params[:current_user_attendances])
      attendances[event.id]
    elsif signed_in?(event, params)
      event.attendances.find_by(attendee: params[:current_user])
    end
  end
end
