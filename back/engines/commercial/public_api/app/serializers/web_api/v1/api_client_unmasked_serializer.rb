# frozen_string_literal: true

module PublicApi
  class WebApi::V1::ApiClientUnmaskedSerializer < WebApi::V1::BaseSerializer
    attribute :secret do |_object, params|
      params[:secret]
    end
  end
end
