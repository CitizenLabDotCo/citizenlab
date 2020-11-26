module HasRoles
  module Definers
    module HasMany
      module Association
        #
        # When called, defines the methods related to role management of a has_many_roles
        # with polymorphic through association options.
        #
        # @example:
        #
        #   class User < ApplicationRecord
        #     has_many_roles :project_moderator, through: :admin_publication_moderator, class: 'Project', source: :publication
        #
        #     [defines all :project_moderator methods here]
        #   end
        #
        class PolymorphicThrough < ::HasRoles::Definers::HasMany::Association::Base
          def call
            define_association_ids_method
            define_association_method
            define_roles_method
            define_add_role_method
            define_remove_role_method
            define_role_query_method
            define_super_role_query_method
            define_association_scope
            define_not_association_scope
          end

          #
          # Defines a method that returns all role associated objects.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def project_moderator_projects
          #       Project.where(id: project_moderator_project_ids)
          #     end
          #   end
          #
          def define_association_method
            role_association_records_ids_name = self.role_association_records_ids_name
            roleable_class                    = self.roleable_class

            define_klass_instance_method(role_association_records_name) do
              # Project.where(id: project_moderator_project_ids)
              roleable_class.where(id: send(role_association_records_ids_name))
            end
          end

          #
          # Defines a method that retrieves the source_id of the through association for all roles.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def project_moderator_project_ids
          #       admin_publication_moderator_admin_publications.where(publication_type: 'Project')
          #                                                     .pluck(:publication_id)
          #     end
          #   end
          #
          def define_association_ids_method
            role_through_association_records_name = self.role_through_association_records_name
            polymorphic_source_type               = self.polymorphic_source_type
            polymorphic_source_foreign_key        = self.polymorphic_source_foreign_key
            roleable_class                        = self.roleable_class

            define_klass_instance_method(role_association_records_ids_name) do
              send(role_through_association_records_name).where(polymorphic_source_type => roleable_class.name)
                                                         .pluck(polymorphic_source_foreign_key)
            end
          end

          #
          # Defines a method that adds one or more roles associated to a given set of records_or_ids.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def add_project_moderator_role(*records_or_ids)
          #       ids = RecordsOrIds.new(records_or_ids).ids
          #       return unless ids.any?
          #
          #       records = AdminPublication.where(publication_id: ids, publication_type: 'Project')
          #       add_role_for('admin_publication_moderator', 'admin_publication_id', records)
          #     end
          #   end
          #
          # TODO: refactor with polymorphic and through association modules.
          # rubocop:disable Metrics/MethodLength
          def define_add_role_method
            through_role_name               = self.through_role_name
            foreign_key                     = self.foreign_key
            through_roleable_class          = self.through_roleable_class
            polymorphic_source_foreign_key  = self.polymorphic_source_foreign_key
            polymorphic_source_type         = self.polymorphic_source_type
            roleable_class                  = self.roleable_class

            define_klass_instance_method(:"add_#{role_name}_role") do |*records_or_ids|
              ids = RecordsOrIds.new(records_or_ids).ids
              return unless ids.any?

              records = through_roleable_class.where(
                polymorphic_source_foreign_key => ids,
                polymorphic_source_type => roleable_class.name
              )
              add_role_for(through_role_name, foreign_key, records)
            end
          end
          # rubocop:enable Metrics/MethodLength

          #
          # Defines a method that removes one or more roles associated to a given set of records_or_ids.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def remove_project_moderator_role(*records_or_ids)
          #       ids = RecordsOrIds.new(records_or_ids).ids
          #       return unless ids.any?
          #
          #       records = AdminPublication.where(publication_id: ids, publication_type: 'Project')
          #       remove_role_for('admin_publication_moderator', 'admin_publication_id', records)
          #     end
          #   end
          #
          # TODO: refactor with polymorphic and through association modules.
          # rubocop:disable Metrics/MethodLength
          def define_remove_role_method
            through_role_name               = self.through_role_name
            foreign_key                     = self.foreign_key
            through_roleable_class          = self.through_roleable_class
            polymorphic_source_foreign_key  = self.polymorphic_source_foreign_key
            polymorphic_source_type         = self.polymorphic_source_type
            roleable_class                  = self.roleable_class

            define_klass_instance_method(:"remove_#{role_name}_role") do |record_or_id|
              ids = RecordsOrIds.new(record_or_id).ids
              return unless ids.any?

              records = through_roleable_class.where(
                polymorphic_source_foreign_key => ids,
                polymorphic_source_type => roleable_class.name
              )
              remove_role_for(through_role_name, foreign_key, records)
            end
          end
          # rubocop:enable Metrics/MethodLength

          #
          # Defines a method that retrieves the source_id of the through association for all roles.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     def project_moderator_roles
          #       admin_publication_moderator_admin_publications.where(publication_type: 'Project')
          #                                                     .pluck(:publication_id)
          #     end
          #   end
          #
          # TODO: refactor with polymorphic and through association modules.
          # rubocop:disable Metrics/AbcSize
          def define_roles_method
            through_role_name                     = self.through_role_name
            polymorphic_source_type               = self.polymorphic_source_type
            roleable_class                        = self.roleable_class
            role_through_association_records_name = self.role_through_association_records_name
            foreign_key                           = self.foreign_key

            define_klass_instance_method(:"#{role_name}_roles") do
              ids = send(role_through_association_records_name).where(polymorphic_source_type => roleable_class.name)
                                                               .pluck(:id)
              send("#{through_role_name}_roles").select { |role| ids.include? role[foreign_key.to_s] }
            end
          end
          # rubocop:enable Metrics/AbcSize

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
          #     def project_moderator?(records_or_ids = nil)
          #       ids = RecordsOrIds.new(record_or_id).ids
          #       return (ids - project_moderator_project_ids).empty? if ids.present?
          #
          #       project_moderator_project_ids.present? || super_project_moderator?
          #     end
          #   end
          #
          def define_role_query_method
            through_role_name                 = self.through_role_name
            role_association_records_ids_name = self.role_association_records_ids_name

            define_klass_instance_method(:"#{role_name}?") do |records_or_ids = nil|
              return false if send("#{through_role_name}_roles").empty?

              ids = RecordsOrIds.new(records_or_ids).ids
              return (ids - send(role_association_records_ids_name)).empty? if ids.present?

              send(role_association_records_ids_name).present? || send(:"super_#{through_role_name}?")
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
          #     def super_project_moderator?
          #       roles_of_type('project_moderator').present? &&
          #         roles_of_type('admin_publication_moderator').any? do |role|
          #           !role.stringify_keys.key?('admin_publication_id')
          #         end
          #     end
          #   end
          #
          def define_super_role_query_method
            through_role_name = self.through_role_name
            role_name         = self.role_name
            foreign_key       = self.foreign_key

            define_klass_instance_method(:"super_#{role_name}?") do
              roles_of_type(through_role_name).any? { |role| !role.key?(foreign_key) } &&
                roles_of_type(role_name).present?
            end
          end

          #
          # Defines a scope that returns all roled objects with a given role.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     scope :project_moderator, lambda { |records_or_ids = nil|
          #       ids = RecordsOrIds.new(records_or_ids).ids
          #       through_records = if ids.any?
          #                           AdminPublication.where(publication_type => 'Project', publication_id => ids)
          #                         else
          #                           AdminPublication.where(publication_type => 'Project')
          #                         end
          #       admin_publication_moderator(through_records.pluck(:id))
          #     }
          #   end
          #
          # TODO: refactor with polymorphic and through association modules.
          # rubocop:disable Metrics/MethodLength
          # rubocop:disable Metrics/AbcSize
          def define_association_scope
            through_roleable_class          = self.through_roleable_class
            polymorphic_source_foreign_key  = self.polymorphic_source_foreign_key
            polymorphic_source_type         = self.polymorphic_source_type
            roleable_class                  = self.roleable_class
            through_role_name               = self.through_role_name

            define_klass_scope :"#{role_name}", lambda { |records_or_ids = nil|
              ids = RecordsOrIds.new(records_or_ids).ids

              through_records = if ids.any?
                                  through_roleable_class.where(
                                    polymorphic_source_type => roleable_class.to_s,
                                    polymorphic_source_foreign_key => ids
                                  )
                                else
                                  through_roleable_class.where(polymorphic_source_type => roleable_class.to_s)
                                end

              send(:"#{through_role_name}", through_records.pluck(:id))
            }
          end
          # rubocop:enable Metrics/AbcSize
          # rubocop:enable Metrics/MethodLength

          #
          # Defines a scope that returns all roled objects without a given role.
          #
          # @example:
          #
          #   class User < ApplicationRecord
          #
          #     scope :not_project_moderator, lambda { |records_or_ids = nil|
          #       ids = RecordsOrIds.new(records_or_ids).ids
          #       through_records = if ids.any?
          #                           AdminPublication.where(publication_type => 'Project', publication_id => ids)
          #                         else
          #                           AdminPublication.where(publication_type => 'Project')
          #                         end
          #       not_admin_publication_moderator(through_records.pluck(:id))
          #     }
          #   end
          #
          # TODO: refactor with polymorphic and through association modules.
          # rubocop:disable Metrics/MethodLength
          # rubocop:disable Metrics/AbcSize
          def define_not_association_scope
            through_roleable_class          = self.through_roleable_class
            polymorphic_source_foreign_key  = self.polymorphic_source_foreign_key
            polymorphic_source_type         = self.polymorphic_source_type
            roleable_class                  = self.roleable_class
            through_role_name               = self.through_role_name

            define_klass_scope :"not_#{role_name}", lambda { |records_or_ids = nil|
              ids = RecordsOrIds.new(records_or_ids).ids

              through_records = if ids.any?
                                  through_roleable_class.where(
                                    polymorphic_source_type => roleable_class.to_s,
                                    polymorphic_source_foreign_key => ids
                                  )
                                else
                                  through_roleable_class.where(polymorphic_source_type => roleable_class.to_s)
                                end

              send(:"not_#{through_role_name}", through_records.pluck(:id))
            }
          end
          # rubocop:enable Metrics/AbcSize
          # rubocop:enable Metrics/MethodLength
        end
      end
    end
  end
end
