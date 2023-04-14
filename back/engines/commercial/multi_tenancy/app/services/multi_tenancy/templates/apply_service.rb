# frozen_string_literal: true

module MultiTenancy
  module Templates
    class ApplyService
      attr_reader :template_bucket, :tenant_bucket

      def initialize(
        tenant_bucket: ENV.fetch('AWS_S3_BUCKET'),
        template_bucket: ENV.fetch('TEMPLATE_BUCKET'),
        s3_client: Aws::S3::Client.new(region: 'eu-central-1')
      )
        @tenant_bucket = tenant_bucket
        @template_bucket = template_bucket
        @s3_client = s3_client
      end

      def apply(template_name)
        template_models = fetch_template_models(template_name)

        model_id_mapping = generate_model_identifiers!(template_models)
        copy_s3_files(template_name, Tenant.current.id, model_id_mapping)

        MultiTenancy::Templates::TenantSerializer.format_for_tenant_template_service!(template_models)
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template_models)
      end

      def copy_s3_files(template_name, tenant_id, model_id_mapping, num_threads: 20)
        prefix = "#{template_name}/uploads"

        s3_utils.copy_objects(
          template_bucket, tenant_bucket, prefix,
          copy_args: { acl: 'public-read' },
          num_threads: num_threads
        ) { |key| transform_key(key, tenant_id, model_id_mapping) }
      end

      private

      def s3_utils
        @s3_utils ||= Aws::S3::Utils.new(@s3_client)
      end

      def transform_key(key, tenant_id, model_id_mapping)
        _template_name, _uploads_namespace, *class_parts, attribute_name, identifier, filename = key.split('/')
        new_identifier = model_id_mapping.fetch(identifier)

        ['uploads', tenant_id, *class_parts, attribute_name, new_identifier, filename].join('/')
      end

      def generate_model_identifiers!(template)
        id_mapping = {}

        template['models'].each do |klass, models|
          next unless klass.attribute_names.include?('id')

          models.each do |id, attributes|
            raise "Template contains duplicate id: #{id}" if id_mapping.key?(id)

            id_mapping[id] = attributes['id'] = SecureRandom.uuid
          end
        end

        id_mapping
      end

      def fetch_template_models(template_name)
        key = "#{template_name}/models.yml"
        content = @s3_client.get_object(bucket: template_bucket, key: key).body.read
        # We have to use YAML.load because templates use yaml aliases.
        YAML.load(content) # rubocop:disable Security/YAMLLoad
      end
    end
  end
end
