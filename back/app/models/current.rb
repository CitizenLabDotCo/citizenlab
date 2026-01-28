# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :tenant, :app_configuration
  attribute :location_headers
  private :tenant=, :app_configuration=

  def app_configuration
    super or (cache_tenant and super)
  end

  def tenant
    super or (cache_tenant and super)
  end

  def reset_tenant
    self.tenant = nil
    self.app_configuration = nil
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
