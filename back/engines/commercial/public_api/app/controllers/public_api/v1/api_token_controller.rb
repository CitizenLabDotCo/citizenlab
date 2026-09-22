# frozen_string_literal: true

class PublicApi::V1::ApiTokenController < AuthToken::AuthTokenController
  include PublicApi::CallerMetadata

  # This endpoint does not inherit from PublicApiController, which logs the same
  # metadata for every other public API request.
  def append_info_to_payload(payload)
    super
    append_caller_info(payload, requested_client_id)
  end

  def entity_name
    'PublicApi::ApiClient'
  end

  def id_param
    :client_id
  end

  def secret_param
    :client_secret
  end

  private

  # The client the request asked to authenticate as; the logged status says
  # whether it was accepted.
  def requested_client_id
    auth = params[:auth]
    auth[id_param] if auth.is_a?(ActionController::Parameters)
  end
end
