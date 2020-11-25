module HasRoles
  module ActiveRecord
    module Roled
      module InstanceMethods
        def add_role_for(role_type, role_id_key, *records_or_ids)
          return unless self.class.associated_role_type?(role_type)

          records_or_ids.flatten.each do |record_or_id|
            add_role(role_type, role_id_key => (record_or_id.is_a?(String) ? record_or_id : record_or_id.id))
          end
        end

        def remove_role_for(role_type, role_id_key, *records_or_ids)
          return unless self.class.associated_role_type?(role_type)

          records_or_ids.flatten.each do |record_or_id|
            remove_role(role_type, role_id_key => (record_or_id.is_a?(String) ? record_or_id : record_or_id.id))
          end
        end

        def roles_of_type(type)
          roles.select { |role| role['type'] == type.to_s }
        end

        def add_role(type, role_attributes = {})
          roles << { 'type' => type.to_s }.merge(role_attributes.stringify_keys)
          roles.uniq!
        end

        def remove_role(type, role_attributes = {})
          roles.delete({ 'type' => type.to_s }.merge(role_attributes.stringify_keys))
        end
      end
    end
  end
end
