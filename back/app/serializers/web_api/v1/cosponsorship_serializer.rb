# frozen_string_literal: true

class WebApi::V1::CosponsorshipSerializer < WebApi::V1::BaseSerializer
  attributes :status

  belongs_to :idea
  belongs_to :user
end
