module SmartGroups
  module Extensions
    module CustomFieldOption
      def self.included(base)
        base.class_eval do
          before_destroy :check_group_references, prepend: true
        end
      end

      def check_group_references
        return unless ::Group.using_custom_field_option(self).exists?

        errors.add(:base, :dangling_group_references,
                   message: ::Group.using_custom_field_option(self).all.map(&:id).join(','))
        throw :abort
      end
    end
  end
end
