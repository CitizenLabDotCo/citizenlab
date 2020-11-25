module HasRoles
  module Definers
    module HasMany
      module Association
        #
        # When called, defines the methods related to role management of a has_many_roles with association options.
        #
        # @example:
        #
        #   class User < ApplicationRecord
        #     has_many_roles :admin_publication_moderator, class: 'AdminPublication', foreign_key: :admin_publication_id
        #
        #     [defines all :admin_publication_moderator methods here]
        #   end
        #
        class Base < ::HasRoles::Definers::HasMany::Base
          def call
            define_role_query_method
            define_super_role_query_method
            define_add_role_method
            define_remove_role_method
            define_association_ids_method
            define_association_method
            define_association_scope
            define_not_association_scope
          end

          private

          #
          # Defines a method that returns true if roles of a given role_name exist.
          #
          # The method can alternatively receive n records or ids and check if the associated role
          # has those records Ids as foreign_keys.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def admin_publication_moderator?(records_or_ids = nil)
          #       return roles_of_type('admin_publication_moderator').any? unless records_or_ids.present?
          #
          #       roles_of_type('admin_publication_moderator').all? do |role|
          #         RecordsOrIds.new(records_or_ids).include?(role['admin_publication_id'])
          #       end
          #     end
          #   end
          #
          def define_role_query_method
            role_name   = self.role_name
            foreign_key = self.foreign_key
            define_klass_instance_method(:"#{role_name}?") do |records_or_ids = nil|
              return roles_of_type(role_name).any? unless records_or_ids.present?

              roles_of_type(role_name).all? { |role| RecordsOrIds.new(records_or_ids).include?(role[foreign_key.to_s]) }
            end
          end

          #
          # Defines a method that returns true a the roled object has a *super role of the given name.
          #
          #   * super roles are associated roles without a foreign_key.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def super_admin_publication_moderator?
          #       roles_of_type('admin_publication_moderator').present? &&
          #         roles_of_type('admin_publication_moderator').any? do |role|
          #           !role.stringify_keys.key?('admin_publication_id')
          #         end
          #     end
          #   end
          #
          def define_super_role_query_method
            role_name   = self.role_name
            foreign_key = self.foreign_key

            define_klass_instance_method(:"super_#{role_name}?") do
              roles_of_type(role_name).any? { |role| !role.stringify_keys.key?(foreign_key.to_s) } &&
                roles_of_type(role_name).present?
            end
          end

          #
          # Defines a method that adds one or more roles associated to a given set of records_or_ids.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def add_admin_publication_moderator_role(*records_or_ids)
          #       add_role_for('admin_publication_moderator', 'admin_publication_id', records_or_ids)
          #     end
          #   end
          #
          def define_add_role_method
            role_name   = self.role_name
            foreign_key = self.foreign_key

            define_klass_instance_method(:"add_#{role_name}_role") do |*records_or_ids|
              add_role_for(role_name, foreign_key, records_or_ids)
            end
          end

          #
          # Defines a method that removes one or more roles associated to a given set of records_or_ids.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def remove_admin_publication_moderator_role(*records_or_ids)
          #       remove_role_for('admin_publication_moderator', 'admin_publication_id', records_or_ids)
          #     end
          #   end
          #
          def define_remove_role_method
            role_name   = self.role_name
            foreign_key = self.foreign_key

            define_klass_instance_method(:"remove_#{role_name}_role") do |*records_or_ids|
              remove_role_for(role_name, foreign_key, records_or_ids)
            end
          end

          #
          # Defines a method that returns all the foreign keys for a given role name.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def admin_publication_moderator_admin_publication_ids
          #       admin_publication_moderator_roles.map { |role| role['admin_publication_id'] }
          #     end
          #   end
          #
          def define_association_ids_method
            role_name   = self.role_name
            foreign_key = self.foreign_key

            define_klass_instance_method(role_association_records_ids_name) do
              send(:"#{role_name}_roles").map { |role| role[foreign_key.to_s] }
            end
          end

          #
          # Defines a method that returns all role associated objects.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def admin_publication_moderator_admin_publications
          #       AdminPublication.where(id: admin_publication_moderator_admin_publication_ids)
          #     end
          #   end
          #
          def define_association_method
            role_association_records_ids_name = self.role_association_records_ids_name
            roleable_class                    = self.roleable_class

            define_klass_instance_method(role_association_records_name) do
              roleable_class.where(id: send(role_association_records_ids_name))
            end
          end

          #
          # Defines a scope that returns all roled objects with a given role.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     scope :admin_publication_moderator, lambda { |records_or_ids = nil|
          #       return where("users.roles @> '#{role_to_json('admin_publication_moderator')}'") if records_or_ids.blank?
          #
          #       query = multiple_role_query('admin_publication_moderator', 'admin_publication_id', records_or_ids)
          #       where(query)
          #     }
          #   end
          #
          def define_association_scope
            role_name = self.role_name
            foreign_key = self.foreign_key

            define_klass_scope role_name, lambda { |records_or_ids = nil|
              return where("#{table_name}.roles @> '#{role_to_json(role_name)}'") if records_or_ids.blank?

              query = multiple_role_query(role_name, foreign_key, records_or_ids)
              where(query)
            }
          end

          #
          # Defines a scope that returns all roled objects without a given role.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     scope :not_admin_publication_moderator, lambda { |records_or_ids = nil|
          #       return where("users.roles @> '#{role_to_json('admin_publication_moderator')}'") if records_or_ids.blank?
          #
          #       query = multiple_role_query('admin_publication_moderator', 'admin_publication_id', records_or_ids)
          #       where.not(query)
          #     }
          #   end
          #
          def define_not_association_scope
            role_name   = self.role_name
            foreign_key = self.foreign_key

            define_klass_scope :"not_#{role_name}", lambda { |records_or_ids = nil|
              return where.not("#{table_name}.roles @> '#{role_to_json(role_name)}'") if records_or_ids.blank?

              query = multiple_role_query(role_name, foreign_key, records_or_ids)
              where.not(query)
            }
          end
        end
      end
    end
  end
end
