class Tenant < ApplicationRecord

  validates :name, :host, presence: true
  validates :host, uniqueness: true

  SETTINGS_JSON_SCHEMA = ERB.new(File.read(Rails.root.join('config', 'schemas', 'tenant_settings.json_schema.erb'))).result(binding)
  validates :settings, presence: true, json: { schema: SETTINGS_JSON_SCHEMA, message: ->(errors) { errors } }

  after_create :create_apartment_tenant
  after_destroy :delete_apartment_tenant

  def create_apartment_tenant
    Apartment::Tenant.create(self.host)
  end

  def delete_apartment_tenant
    Apartment::Tenant.drop(self.host)
  end

end
