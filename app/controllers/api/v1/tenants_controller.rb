class Api::V1::TenantsController < ApplicationController

  def current
    skip_authorization
    puts "current_tenant", Apartment::Tenant.current
    @tenant = Tenant.find_by host: Apartment::Tenant.current
    p @tenant
    render json: @tenant
  end
end
