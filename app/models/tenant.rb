class Tenant < ApplicationRecord

  validates :name, :host, presence: true
  validates :host, uniqueness: true

  SETTINGS_JSON_SCHEMA_STR = ERB.new(File.read(Rails.root.join('config', 'schemas', 'tenant_settings.json_schema.erb'))).result(binding)
  SETTINGS_JSON_SCHEMA = JSON.parse(SETTINGS_JSON_SCHEMA_STR)
  validates :settings, presence: true, json: { schema: SETTINGS_JSON_SCHEMA_STR, message: ->(errors) { errors } }

  after_create :create_apartment_tenant
  after_destroy :delete_apartment_tenant
  after_update :update_tenant_schema, if: :host_changed?

  before_validation :validate_missing_feature_dependencies


  private

  def self.current
    find_by!(host: Apartment::Tenant.current)
  end

  def self.settings *path
   self.current.settings.dig(*path)
  end

  def create_apartment_tenant
    Apartment::Tenant.create(self.host)
  end

  def delete_apartment_tenant
    Apartment::Tenant.drop(self.host)
  end

  def update_tenant_schema
    old_schema = self.host_was
    new_schema = self.host.gsub(/\./, "_")
    ActiveRecord::Base.connection.execute("ALTER SCHEMA #{old_schema} RENAME TO #{new_schema}")
  end

  def validate_missing_feature_dependencies
    ss = SettingsService.new
    missing_dependencies = ss.missing_dependencies(settings, SETTINGS_JSON_SCHEMA)
    unless missing_dependencies.empty?
      errors.add(:settings, "has unactive features that other features are depending on: #{missing_dependencies}")
    end
  end


end
