module HasRoles
  module ActiveRecord
    module Roled
      module ClassMethods
        attr_reader :reflections_on_role_associations, :roles

        def role_to_json(role_name, properties = {})
          JSON.generate([properties.merge({ type: role_name })])
        end

        def role_query(role_name, foreign_key, id)
          "#{table_name}.roles @> '#{role_to_json(role_name, foreign_key => id)}'"
        end

        def multiple_role_query(role_name, foreign_key, records_or_ids)
          RecordsOrIds.map_ids(records_or_ids) { |id| role_query(role_name, foreign_key, id) }.join(' OR ')
        end

        def associated_role_type?(role_name)
          @reflections_on_role_associations.key?(role_name)
        end
      end
    end
  end
end
