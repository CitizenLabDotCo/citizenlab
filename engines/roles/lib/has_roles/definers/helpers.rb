module HasRoles
  module Definers
    module Helpers
      def self.included(base)
        base.class_eval do
          attr_reader :klass, :role_name, :options, :roles_config
          class << self
            def define(*args)
              new(*args).call
            end
          end
        end
      end

      def initialize(klass, role_name, options = {})
        @klass             = klass
        @role_name         = role_name
        @options           = options
        @roles_config      = Roles::RoleMapping.new(klass, role_name)
      end

      delegate :associated?, :polymorphic?, :through?,
              :polymorphic_through?, :roleable_class,
              :association_name, :association_records_name,
              :role_association_records_name, :role_association_records_ids_name,
              :polymorphic_source, :polymorphic_source_foreign_key, :polymorphic_source_type,
              :through_role_name, :through_role_options, :through_roleable_class,
              :through_association_name, :through_association_name, :through_association_records_name,
              :role_through_association_records_name, :role_through_association_records_ids_name,
              :foreign_key, to: :roles_config, allow_nil: true

      def call; end

      private

      def klass_class_eval(&blk)
        klass.class_eval(&blk)
      end

      def define_klass_instance_method(method_name, &blk)
        klass_class_eval do
          define_method(method_name, &blk)
        end
      end

      def define_klass_class_method(method_name, &blk)
        klass_class_eval do
          define_singleton_method(method_name, &blk)
        end
      end

      def define_klass_scope(scope_name, scope_lambda)
        klass_class_eval do
          singleton_class.undef_method scope_name if respond_to?(scope_name)

          scope(scope_name, scope_lambda)
        end
      end
    end
  end
end
