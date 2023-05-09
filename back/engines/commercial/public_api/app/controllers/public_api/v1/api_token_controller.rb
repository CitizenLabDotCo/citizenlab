# frozen_string_literal: true

class PublicApi::V1::ApiTokenController < AuthTokenController
  def entity_name
    'PublicApi::ApiClient'
  end

  def id_param
    :cient_id
  end

  def secret_param
    :client_secret
  end
end
