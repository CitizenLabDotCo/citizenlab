class Api::V1::TenantsController < ApplicationController

  def current
    skip_authorization
    @tenant = Tenant.find_by host: Apartment::Tenant.current
    render json: @tenant
  end
end
