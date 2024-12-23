# frozen_string_literal: true

class WebApi::V1::ProjectReviewSerializer < WebApi::V1::BaseSerializer
  attributes(
    :state,
    :approved_at,
    :created_at,
    :updated_at
  )

  belongs_to :project
  belongs_to :requester, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :reviewer, record_type: :user, serializer: WebApi::V1::UserSerializer
end
