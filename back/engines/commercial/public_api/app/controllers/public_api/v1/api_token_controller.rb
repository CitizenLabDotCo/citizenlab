# frozen_string_literal: true

class PublicApi::V1::ApiTokenController < AuthTokenController
  def entity_name
    'PublicApi::ApiClient'
  end
end
