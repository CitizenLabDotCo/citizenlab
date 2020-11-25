module HasRoles
  module ActiveRecord
    module Roled
      def self.included(base)
        base.class_eval do
          extend ActiveRecord::Roled::ClassMethods     unless ancestors.include?(ActiveRecord::Roled::ClassMethods)
          include ActiveRecord::Roled::Scopes          unless included_modules.include?(ActiveRecord::Roled::Scopes)

          unless included_modules.include?(ActiveRecord::Roled::InstanceMethods)
            include ActiveRecord::Roled::InstanceMethods
          end
        end
      end
    end
  end
end
