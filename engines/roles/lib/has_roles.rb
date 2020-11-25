require 'has_roles/active_record/has_roles'

module HasRoles
  extend ActiveSupport::Autoload

  autoload :HasRoles
end

ActiveSupport.on_load(:active_record) do
  extend HasRoles::ActiveRecord::HasRoles
end
