# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :tenant

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
end
