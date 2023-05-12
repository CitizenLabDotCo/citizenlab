# frozen_string_literal: true

class PublicApi::V2::ApiTokenController < AuthToken::AuthTokenController
  def entity_name
    'PublicApi::ApiClient'
  end

  def id_param
    :client_id
  end

  def secret_param
    :client_secret
  end
end
