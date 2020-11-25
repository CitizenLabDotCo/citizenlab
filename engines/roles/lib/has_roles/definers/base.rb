module HasRoles
  module Definers
    class Base
      include Definers::Helpers

      def initialize(klass, role_name, options = {})
        @klass        = klass
        @role_name    = role_name
        @options      = options
        @roles_config = Roles::RoleMapping.new(klass, role_name)
      end
    end
  end
end
