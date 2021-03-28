# frozen_string_literal: true

# Tenant must be defined in the core to run +db:schema:load+.
class Tenant < ApplicationRecord
  include_if_ee('MultiTenancy::Tenant')
end
