class PublicApi::V1::ApiTokenController < Knock::AuthTokenController

  def authenticate
    unless entity.present? && entity.authenticate(auth_params[:client_secret])
      raise Knock.not_found_exception_class
    end
  end

  def entity_name
    "PublicApi::ApiClient"
  end

  def auth_params
    params.require(:auth).permit :client_id, :client_secret
  end
end
