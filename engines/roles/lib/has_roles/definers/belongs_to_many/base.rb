module HasRoles
  module Definers
    module BelongsToMany
      #
      # When called, defines the inverse methods on the roleable object.
      #
      # @example:
      #
      #   class Project < ApplicationRecord
      #     belongs_to_many_roled :project_moderators, class: 'User'
      #
      #     [defines all :project_moderators methods here]
      #   end
      #
      class Base < ::HasRoles::Definers::Base
        def initialize(klass, role_name, options = {})
          @klass      = klass
          @role_name  = role_name
          @options    = options
        end

        def call
          define_roled_association_method
          define_destroy_roled_association_method
          define_roled_callbacks
        end

        #
        # Defines a method that returns all roled objects with roles with a given name.
        #
        # @example:
        #
        #   class Project < ApplicationRecord
        #     def project_moderators
        #       User.project_moderator(self)
        #     end
        #   end
        #
        def define_roled_association_method
          roled_class            = self.roled_class
          roled_association_name = self.roled_association_name

          define_klass_instance_method(role_name) do
            roled_class.send(roled_association_name, self)
          end
        end

        #
        # Defines a method that removes all roles for a given type and the .
        #
        # @example:
        #
        #   class Project < ApplicationRecord
        #     def destroy_project_moderator_roles
        #       project_moderators.each do |pm|
        #         pm.remove_project_moderator_role(self)
        #       end
        #     end
        #   end
        #
        def define_destroy_roled_association_method
          role_name              = self.role_name
          roled_association_name = self.roled_association_name

          define_klass_instance_method(:"destroy_#{roled_association_name}_roles") do
            send(role_name).each do |roled_record|
              roled_record.send(:"remove_#{roled_association_name}_role", self)
              roled_record.save
            end
          end
        end

        #
        # Queues a callback that removes project_moderator roles before_destroy.
        #
        # @example:
        #
        #  class Project < ApplicationRecord
        #    before_destroy :destroy_project_moderator_roles
        #  end
        #
        def define_roled_callbacks
          roled_association_name = self.roled_association_name
          klass_class_eval do
            before_destroy :"destroy_#{roled_association_name}_roles"
          end
        end

        #
        # Returns the :class of the roled object the role belongs_to.
        #
        # @example:
        #
        #   class Project < ApplicationRecord
        #     belongs_to_many_roled :project_moderators, class: 'User'
        #   end
        #
        # @return [User]
        #
        def roled_class
          options.dig(:class).to_s.yield_self do |class_name|
            autoload(class_name) unless Object.const_defined? class_name
            class_name.safe_constantize
          end
        end

        #
        # Returns the role_name of the roled object the role belongs_to.
        #
        # @example:
        #
        #   class Project < ApplicationRecord
        #     belongs_to_many_roled :project_moderators, class: 'User'
        #   end
        #
        # @return 'project_moderator'
        #
        def roled_association_name
          role_name.to_s.singularize
        end
      end
    end
  end
end
