# frozen_string_literal: true

class WebApi::V1::EventSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :location_multiloc, :start_at, :end_at, :created_at, :updated_at

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  belongs_to :project

  belongs_to(
    :user_attendance,
    record_type: WebApi::V1::Events::AttendanceSerializer.record_type,
    serializer: WebApi::V1::Events::AttendanceSerializer
  ) do |event, params|
    if (attendances = params[:current_user_attendances])
      attendances[event.id]
    elsif signed_in?(event, params)
      event.attendances.find_by(attendee: params[:current_user])
    end
  end
end
