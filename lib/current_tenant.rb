class CurrentTenant
  def self.get
    tenant_host = Apartment::Tenant.current
    Tenant.find_by!(host: tenant_host)
  end
end
