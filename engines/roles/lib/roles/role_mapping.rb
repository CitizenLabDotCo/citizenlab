module Roles
  class RoleMapping
    attr_reader :klass, :role_name, :options

    def initialize(klass, role_name)
      @klass        = klass
      @role_name    = role_name
      @options      = klass.roles[role_name].with_indifferent_access
    end

    def find_roleable(roleable_id)
      return unless roleable_class && roleable_id

      roleable_class.find(roleable_id)
    end

    def associated?
      options.key?(:class) &&
        roleable_class.ancestors.include?(::ActiveRecord::Base) &&
        foreign_key.present?
    end

    def polymorphic?
      options.key?(:as) && associated?
    end

    def through?
      options.key?(:through) && roleable_class.ancestors.include?(::ActiveRecord::Base)
    end

    def polymorphic_through?
      through? && options.key?(:source)
    end

    def roleable_class
      options.dig(:class).to_s.safe_constantize
    end

    def foreign_key
      through? ? through_role_options.dig(:foreign_key) : options.dig(:foreign_key)
    end

    def association_name(namespace: true)
      if namespace
        roleable_class.name.underscore.gsub('/', '_')
      else
        roleable_class.name.demodulize.underscore.gsub('/', '_')
      end
    end

    def association_records_name
      association_name.pluralize
    end

    def role_association_records_name
      :"#{role_name}_#{association_records_name}"
    end

    def role_association_records_ids_name
      :"#{role_name}_#{association_name}_ids"
    end

    def polymorphic_source
      options.dig(:source)
    end

    def polymorphic_source_foreign_key
      :"#{polymorphic_source}_id"
    end

    def polymorphic_source_type
      :"#{polymorphic_source}_type"
    end

    def through_role_name
      options.dig(:through)
    end

    def find_polymorphic_source(record_or_id)
      id = record_or_id.is_a?(::ActiveRecord::Base) ? record_or_id.id : record_or_id

      through_roleable_class.find_by(
        polymorphic_source_type => roleable_class.to_s,
        polymorphic_source_foreign_key => id
      )
    end

    def through_role_options
      klass.reflections_on_role_associations[through_role_name]
    end

    def through_roleable_class
      through_role_options.dig(:class).to_s.safe_constantize
    end

    def through_association_name
      through_roleable_class.name.underscore.gsub('/', '_')
    end

    def through_association_records_name
      through_association_name.pluralize
    end

    def role_through_association_records_name
      :"#{through_role_name}_#{through_association_records_name}"
    end

    def role_through_association_records_ids_name
      :"#{through_role_name}_#{through_association_name}_ids"
    end

    def roleable_primary_key(namespace: true)
      [association_name(namespace: namespace), 'id'].join('_')
    end

    def permitted_params
      return [] unless associated?

      [roleable_primary_key(namespace: false), roled_resource_primary_key]
    end

    def roled_resource_primary_key
      [klass_config_name.to_s.singularize, 'id'].join('_')
    end

    def role_association_foreign_key

      [association_name(namespace: false), 'id'].join('_')
    end

    def klass_config_name
      klass.to_s.underscore.pluralize.to_sym
    end

    def serializer
      self.class.serializer_options.dig(klass_config_name)
    end

    def subscriber
      return unless self.class.subscriber_options

      self.class.subscriber_options.dig(klass_config_name, role_name).yield_self do |subcriber_object|
        return subcriber_object if subcriber_valid?(subcriber_object)
      end
    end

    def policy
      return unless self.class.policy_options

      self.class.policy_options.dig(klass_config_name, role_name).yield_self do |policy_object|
        return policy_object if policy_object&.ancestors&.include? ApplicationPolicy
      end
    end

    def subcriber_valid?(subscriber)
      subscriber.respond_to?(:before_create) && subscriber.respond_to?(:after_create) &&
        subscriber.respond_to?(:before_destroy) && subscriber.respond_to?(:after_destroy)
    end

    class << self
      attr_reader :serializer_options, :subscriber_options, :policy_options

      def add_serializer_options(serializer_options)
        @serializer_options = serializer_options.with_indifferent_access
      end

      def add_subscriber_options(subscriber_options)
        @subscriber_options = subscriber_options.with_indifferent_access
      end

      def add_policy_options(policy_options)
        @policy_options = policy_options.with_indifferent_access
      end
    end
  end
end
