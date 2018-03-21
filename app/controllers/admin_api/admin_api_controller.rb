class AdminApi::AdminApiController < ActionController::API
  before_action :authenticate_request
  around_action :switch_tenant

  def authenticate_request
    unless request.headers["Authorization"] == ENV.fetch("ADMIN_API_TOKEN")
      render json: { error: 'Not Authorized' }, status: 401
      false
    end
  end

  def switch_tenant
  	if params[:tenant_id]
  	  Apartment::Tenant.switch(params[:tenant_id]) do
  		  yield
  	  end
  	else
  		yield
  	end
  end
end