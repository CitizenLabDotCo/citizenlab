# frozen_string_literal: true

module PublicApi
  class WebApi::V1::ApiClientSerializer < WebApi::V1::BaseSerializer
    attributes :name, :created_at, :last_used_at, :last_user_agent

    attribute :masked_secret do |object|
      "***#{object.secret_postfix}"
    end
  end
end
