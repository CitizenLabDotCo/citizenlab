require 'roles/engine'
require 'roles/rails/routes'

module Roles
  def self.configure(&_blk)
    yield self
  end

  def self.serializers=(options)
    ::Roles::RoleMapping.add_serializer_options(options)
  end

  def self.subscribers=(options)
    ::Roles::RoleMapping.add_subscriber_options(options)
  end

  def self.policies=(options)
    ::Roles::RoleMapping.add_policy_options(options)
  end
end
