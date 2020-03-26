module Volunteering
  class WebApi::V1::VolunteerSerializer < ::WebApi::V1::BaseSerializer
    attributes :created_at, :updated_at
    belongs_to :cause
    belongs_to :user, serializer: ::WebApi::V1::UserSerializer
  end
end
