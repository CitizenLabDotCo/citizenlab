# frozen_string_literal: true

class PublicApi::V2::EventAttendanceSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :event_id,
    :attendee_id,
    :created_at,
    :updated_at
end
