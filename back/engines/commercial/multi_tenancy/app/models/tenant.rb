# frozen_string_literal: true

# == Schema Information
#
# Table name: public.tenants
#
#  id                    :uuid             not null, primary key
#  name                  :string
#  host                  :string
#  settings              :jsonb
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  logo                  :string
#  favicon               :string
#  style                 :jsonb
#  deleted_at            :datetime
#  creation_finalized_at :datetime
#
# Indexes
#
#  index_tenants_on_creation_finalized_at  (creation_finalized_at)
#  index_tenants_on_deleted_at             (deleted_at)
#  index_tenants_on_host                   (host)
#
class Tenant < ApplicationRecord
  attr_accessor :config_sync_enabled

  validates :name, :host, presence: true
  validates :host, uniqueness: true, exclusion: { in: %w[schema-migrations public] }
  validate :valid_host_format

  after_initialize :custom_initialization
  after_create :create_apartment_tenant

  after_update :update_tenant_schema, if: :saved_change_to_host?
  after_update :update_app_configuration, if: :config_sync_enabled
  after_destroy :delete_apartment_tenant

  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :creation_finalized, -> { not_deleted.where.not(creation_finalized_at: nil) } # Use safe_switch_each instead
  scope :churned, -> { with_lifecycle('churned') }
  scope :with_lifecycle, lambda { |lifecycle|
    ids = AppConfiguration
      .from_tenants(self)
      .select { |config| config.settings('core', 'lifecycle_stage') == lifecycle }
      .pluck(:id)

    # We can use app configuration ids to query tenants because tenants and
    # app configurations share the same ids.
    where(id: ids)
  }

  delegate :active?, :churned?, to: :configuration

  class << self
    def schema_name_to_host(schema_name)
      schema_name&.tr('_', '.')
    end

    def host_to_schema_name(host)
      host&.tr('.', '_')
    end

    def by_schema_name!(schema_name)
      host = schema_name_to_host(schema_name)
      find_by!(host: host)
    end

    # Reorder tenants by most important tenants (active) first
    def prioritize(tenants)
      priority_order = %w[active trial demo expired_trial churned not_applicable]
      tenant_lifecycles = AppConfiguration.from_tenants(tenants).map do |config|
        { id: config[:id], lifecycle_stage: config[:settings]['core']['lifecycle_stage'] }
      end
      ordered_tenants = tenant_lifecycles.sort_by { |tenant| priority_order.index(tenant[:lifecycle_stage]) }
      ordered_ids = ordered_tenants.pluck(:id)
      tenants.sort_by { |tenant| ordered_ids.index(tenant[:id]) }
    end

    def safe_switch_each(scope: nil)
      scope ||= not_deleted.where.not(creation_finalized_at: nil)
      prioritize(scope).each do |tenant|
        next if !Tenant.exists?(id: tenant.id)

        tenant.switch do
          yield tenant
        end
      end
    end
  end

  def self.current
    Current.tenant
  end

  def self.safe_current
    Current.tenant
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def self.settings(*path)
    ErrorReporter.report_msg('Tenant::settings is deprecated. Use AppConfiguration#settings instead.')
    AppConfiguration.instance.settings(*path)
  end

  def settings
    ErrorReporter.report_msg('Tenant#settings is deprecated. Use AppConfiguration#settings instead.')
    AppConfiguration.instance.settings
  end

  def custom_initialization
    @config_sync_enabled = true
  end

  def without_config_sync
    self.config_sync_enabled = false
    yield self
  ensure
    self.config_sync_enabled = true
  end

  # @return [String, nil] +nil+ if the tenant has not been persisted yet.
  #   Otherwise, the name of the corresponding PG schema.
  def schema_name
    # The reason for using `host_was` and not `host` is
    # because the schema name would be wrong when updating
    # the tenant's host. `host_was` should always
    # correspond to the value as it currently is in the
    # database.
    Tenant.host_to_schema_name(host_was)
  end

  # Returns the app configuration of the tenant.
  #   config = tenant.configuration
  # If the optional code block is specified, it will be run in the context of
  # the tenant and the result returned. This is particularly suitable for
  # modifying the configuration. (Otherwise, there is no guarantee that any
  # modifications made to the returned object are run in the context of the
  # tenant).
  #   tenant.configuration do |config|
  #     config.update(...)
  #   end
  #
  # @return [AppConfiguration, Object]
  def configuration
    switch do
      app_config = AppConfiguration.instance
      block_given? ? (yield app_config) : app_config
    end
  end

  def switch(&)
    raise Apartment::TenantNotFound unless schema_name

    Apartment::Tenant.switch(schema_name, &)
  end

  def switch!
    raise Apartment::TenantNotFound unless schema_name

    Apartment::Tenant.switch!(schema_name)
  end

  def self.switch_to(host_name)
    find_by!(host: host_name).switch!
  end

  def changed_lifecycle_stage?
    return false unless settings_previously_changed?

    lifecycle_change_diff.uniq.size > 1
  end

  def lifecycle_change_diff
    settings_previous_change.map { |s| s&.dig('core', 'lifecycle_stage') }
  end

  def deleted?
    !!deleted_at
  end

  private

  def update_app_configuration
    switch do
      config = AppConfiguration.instance
      tenant = Tenant.current
      attrs_delta = attributes_delta(tenant, config)

      return if attrs_delta.blank?

      config.attributes = attrs_delta
      config.without_tenant_sync(&:save)
    end
  end

  def attributes_delta(new_obj, old_obj)
    common_attrs = %w[id host name created_at updated_at]
    new_attributes = new_obj.attributes
    old_attributes = old_obj.attributes

    new_attributes
      .slice(*common_attrs)
      .reject { |key, new_value| new_value == old_attributes[key] }
  end

  def create_apartment_tenant
    Apartment::Tenant.create(schema_name)
  end

  def delete_apartment_tenant
    Apartment::Tenant.drop(schema_name)
  end

  def update_tenant_schema
    old_schema = saved_change_to_host.first.tr('.', '_')
    new_schema = schema_name
    ActiveRecord::Base.connection.execute("ALTER SCHEMA \"#{old_schema}\" RENAME TO \"#{new_schema}\"")
    # If we were in the apartment of the altered tenant, we switch to the new schema.
    Apartment::Tenant.switch!(new_schema) if old_schema == Apartment::Tenant.current
  end

  def valid_host_format
    return if host == 'localhost'
    return unless host.exclude?('.') || host.include?(' ') || host.include?('_') || (host =~ /[A-Z]/)

    errors.add(
      :host,
      :invalid_format,
      message: 'The chosen host does not have a valid format'
    )
  end
end
