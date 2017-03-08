class Tenant < ApplicationRecord

  validates :name, :host, presence: true
  validates :host, uniqueness: true

  SETTINGS_JSON_SCHEMA_STR = ERB.new(File.read(Rails.root.join('config', 'schemas', 'tenant_settings.json_schema.erb'))).result(binding)
  SETTINGS_JSON_SCHEMA = JSON.parse(SETTINGS_JSON_SCHEMA_STR)
  validates :settings, presence: true, json: { schema: SETTINGS_JSON_SCHEMA_STR, message: ->(errors) { errors } }

  after_create :create_apartment_tenant
  after_destroy :delete_apartment_tenant

  before_validation :validate_missing_feature_dependencies


  private

  def create_apartment_tenant
    Apartment::Tenant.create(self.host)
  end

  def delete_apartment_tenant
    Apartment::Tenant.drop(self.host)
  end

  def validate_missing_feature_dependencies
    ss = SettingsService.new
    missing_dependencies = ss.missing_dependencies(settings, SETTINGS_JSON_SCHEMA)
    unless missing_dependencies.empty?
      errors.add(:settings, "has unactive features that other features are depending on: #{missing_dependencies}")
    end
  end


end
