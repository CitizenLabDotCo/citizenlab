class WebApi::V1::AttendanceSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at

  belongs_to :event
  belongs_to :user
end
