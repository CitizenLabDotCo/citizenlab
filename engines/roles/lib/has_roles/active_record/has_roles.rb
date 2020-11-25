module HasRoles
  module ActiveRecord
    module HasRoles
      # rubocop:disable Naming/PredicateName
      def has_many_roles(role_name, options = {})
        @roles                                      ||= {}.with_indifferent_access
        @reflections_on_role_associations           ||= {}.with_indifferent_access
        @roles[role_name]                             = options
        @reflections_on_role_associations[role_name]  = options.merge(type: :has_many) if options.key?(:class)

        include Roled
        Definers::HasMany::Base.define(self, role_name, options)
      end

      def has_one_role(role_name, options = {})
        @roles                                      ||= {}.with_indifferent_access
        @reflections_on_role_associations           ||= {}.with_indifferent_access
        @roles[role_name]                             = options
        @reflections_on_role_associations[role_name]  = options.merge(type: :has_one) if options.key?(:class)

        include Roled
        Definers::HasOne::Base.define(self, role_name, options)
      end
      # rubocop:enable Naming/PredicateName

      def belongs_to_many_roled(role_name, options = {})
        @reflections_on_roled_associations          ||= {}.with_indifferent_access
        @reflections_on_roled_associations[role_name] = options

        Definers::BelongsToMany::Base.define(self, role_name, options)
      end
    end
  end
end
