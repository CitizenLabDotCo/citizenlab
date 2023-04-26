# frozen_string_literal: true

module MultiTenancy
  module Templates
    class ApplyService
      attr_reader :internal_template_dir

      def initialize(
        internal_template_dir: Rails.root.join('config/tenant_templates'),
        tenant_bucket: ENV.fetch('AWS_S3_BUCKET', nil),
        template_bucket: ENV.fetch('TEMPLATE_BUCKET', nil),
        s3_client: nil
      )
        @internal_template_dir = internal_template_dir
        @tenant_bucket = tenant_bucket
        @template_bucket = template_bucket

        @s3_client ||= Aws::S3::Client.new(
          region: ENV.fetch('AWS_REGION', 'eu-central-1')
        )
      end

      def apply(template_name, external_template_group: nil)
        if template_utils.internal_template?(template_name)
          apply_internal_template(template_name)
        else
          apply_external_template(template_name, prefix: external_template_group)
        end
      end

      def apply_internal_template(template_name)
        serialized_models = template_utils.fetch_internal_template_models(template_name)
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(serialized_models)
      end

      def apply_external_template(template_name, prefix: nil)
        prefix ||= template_utils.release_prefix
        template_models = template_utils.fetch_external_template_models(template_name, prefix: prefix)
        model_id_mapping = generate_model_identifiers!(template_models)

        template_prefix = template_utils.template_prefix(template_name, prefix: prefix)
        copy_s3_files(template_prefix, Tenant.current.id, model_id_mapping)

        MultiTenancy::Templates::TenantSerializer.format_for_deserializer!(template_models)
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template_models)
      end

      def tenant_bucket
        @tenant_bucket ||= raise ArgumentError, 'tenant_bucket parameter has not been specified'
      end

      def template_bucket
        @template_bucket ||= raise ArgumentError, 'template_bucket parameter has not been specified'
      end

      private

      def s3_utils
        @s3_utils ||= Aws::S3::Utils.new(@s3_client)
      end

      def template_utils
        @template_utils ||= MultiTenancy::Templates::Utils.new(
          internal_template_dir: internal_template_dir,
          template_bucket: @template_bucket,
          s3_client: @s3_client
        )
      end

      def copy_s3_files(template_prefix, tenant_id, model_id_mapping, num_threads: 20)
        uploads_prefix = "#{template_prefix}/uploads/"

        s3_utils.copy_objects(
          template_bucket, tenant_bucket, uploads_prefix,
          copy_args: { acl: 'public-read' },
          num_threads: num_threads
        ) do |key|
          key = key.delete_prefix(uploads_prefix)
          transform_key(key, tenant_id, model_id_mapping)
        end
      end

      def transform_key(key, tenant_id, model_id_mapping)
        *class_parts, attribute_name, identifier, filename = key.split('/')
        new_identifier = model_id_mapping.fetch(identifier)

        ['uploads', tenant_id, *class_parts, attribute_name, new_identifier, filename].join('/')
      end

      # Generates new identifiers (UUID-4) for all models that have an id attribute. The
      # identifiers are added to the attributes of the serialized models (in-place). The
      # method also returns a mapping from the old identifiers to the new ones.
      #
      # @note Generating the identifiers before the models are persisted allows us to
      #   copy the uploads to the correct location before creating the models.
      # @param [Hash] serialized_models A hash of serialized models as produced by
      #   `TenantSerializer#serialize`.
      # @return [Hash] A mapping from old identifiers to new identifiers.
      def generate_model_identifiers!(serialized_models)
        id_mapping = {}

        serialized_models['models'].each do |klass, models|
          next unless klass.attribute_names.include?('id')

          models.each do |id, attributes|
            raise "Template contains duplicate id: #{id}" if id_mapping.key?(id)

            id_mapping[id] = attributes['id'] = SecureRandom.uuid
          end
        end

        id_mapping
      end
    end
  end
end
