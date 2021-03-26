class UpdateTenantOrganizationTypes < ActiveRecord::Migration[5.1]
  def change
    Tenant
      .where("settings#>>'{core,organization_type}' = ?", "city")
      .each do |tenant|
        tenant.settings['core']['organization_type'] = "medium_city"
        tenant.save
      end
    Tenant
      .where("settings#>>'{core,organization_type}' = ?", "town")
      .each do |tenant|
        tenant.settings['core']['organization_type'] = "small_city"
        tenant.save
      end
  end
end
