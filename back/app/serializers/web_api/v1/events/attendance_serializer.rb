# frozen_string_literal: true

class WebApi::V1::Events::AttendanceSerializer < WebApi::V1::BaseSerializer
  attributes :created_at

  belongs_to :attendee, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :event, serializer: WebApi::V1::EventSerializer
end
