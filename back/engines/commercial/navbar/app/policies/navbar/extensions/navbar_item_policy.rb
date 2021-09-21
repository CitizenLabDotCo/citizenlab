module Navbar
  module Extensions
    module NavbarItemPolicy
      def update?
        user&.active? && user.admin?
      end
    end
  end
end
