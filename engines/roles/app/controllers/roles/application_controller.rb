module Roles
  class ApplicationController < ::ApplicationController
    include ::Roles::Authorizable
    include ::Roles::Serializable
    include ::Roles::Subscribable
    include ::Roles::RoleMappable
  end
end
