# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :tenant, :app_configuration
  attribute :location_headers

  # Request origin ('mcp' during an MCP tool run, else nil). Read by LogActivityJob.
  attribute :activity_channel

  # Per-request cache of the global 'visiting' permission, which every inherited
  # permission is resolved from. See Permissions::PermissionInheritanceService.
  attribute :global_visiting_permission

  # Early access features the current admin opted into. Empty outside a web
  # request, so jobs, rake tasks and the console are never affected by one.
  attribute :early_access_features

  private :tenant=, :app_configuration=

  NO_EARLY_ACCESS_FEATURES = Set.new.freeze

  # Read on every feature check, so the empty case must not allocate.
  def early_access_features
    super || NO_EARLY_ACCESS_FEATURES
  end

  def app_configuration
    super or (cache_tenant and super)
  end

  def tenant
    super or (cache_tenant and super)
  end

  def reset_tenant
    self.tenant = nil
    self.app_configuration = nil
    self.global_visiting_permission = nil
    self.early_access_features = nil
  end

  # This attribute is used to globally disable some model validations and callbacks that
  # are causing issues when loading tenant templates. For instance:
  # - Checking for the presence of an uploaded file in a validation triggers the
  #   download of the file from the remote storage, which we want to avoid for
  #   performance reasons.
  # - Some models reference each other and require the other model to exist to be valid.
  #   Normally, they are created together (e.g., with nested attributes), but this is
  #   not something that can be easily done when loading tenant templates.
  # For more examples, check the usages of `Current.loading_tenant_template`.
  attribute :loading_tenant_template

  private

  def cache_tenant
    self.tenant = Tenant.by_schema_name!(Apartment::Tenant.current)
    self.app_configuration = AppConfiguration.send(:first!)
  rescue StandardError
    # Making sure the tenant is not partially cached if an error occurs.
    reset_tenant
    raise
  end
end
