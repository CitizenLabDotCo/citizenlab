# frozen_string_literal: true

module MultiTenancy
  module Templates
    # Creates self-contained S3-based templates from tenants:
    # - *self-contained* because they include both the tenant data (serialized DB records)
    #   and the uploaded files (images, documents, etc.)
    # - *S3-based* because uploaded files are copied directly from the S3 bucket where the
    #   tenant uploads are stored to the S3 bucket where the template will be stored. As
    #   a result, `CreateService` is highly coupled with S3.
    #
    # Organization of the template bucket:
    #   template_bucket
    #   └── prefix (e.g. release or test)
    #       ├── template_name_1 (= host of the tenant)
    #       │   ├── models.yml
    #       ⋮   └── uploads > model > id > file
    #       └── template_name_N
    class CreateService
      attr_reader :template_bucket, :tenant_bucket

      # @param [String, nil] tenant_bucket Name of the bucket where the tenant uploads
      #   are stored. Defaults to 'cl2-tenants-production-benelux'.
      # @param [String, nil] template_bucket Name of the bucket where the templates will
      #   be stored. Defaults to the value of the TEMPLATE_BUCKET environment variable.
      # @param [Aws::S3::Client, nil] s3_client The S3 client to use.
      def initialize(
        tenant_bucket: 'cl2-tenants-production-benelux',
        template_bucket: ENV.fetch('TEMPLATE_BUCKET'),
        tenant_s3_client: Aws::S3::Client.new(region: ENV.fetch('AWS_REGION')),
        templates_s3_client: Aws::S3::Client.new(region: 'eu-central-1')
      )
        @template_bucket = template_bucket
        @tenant_bucket = tenant_bucket
        @tenant_s3_client = tenant_s3_client
        @templates_s3_client = templates_s3_client
      end

      # @param [Object] tenant The tenant to create a template from.
      # @param [String] prefix The S3 prefix to use for the template.
      def create(tenant, prefix: template_utils.test_prefix)
        serialized_models = MultiTenancy::Templates::TenantSerializer.new(tenant).run
        template_name = send(:template_name, tenant)
        template_s3_prefix = template_utils.template_prefix(template_name, prefix: prefix)

        # Delete existing template if it exists. We do this as late as possible to avoid
        # deleting the template if the previous steps fails (e.g. serialization).
        delete_s3_objects(template_bucket, template_s3_prefix)

        copy_s3_uploads(tenant.id, template_s3_prefix, models: serialized_models)
        copy_to_s3(serialized_models.to_yaml, "#{template_s3_prefix}/models.yml")
      end

      private

      def delete_s3_objects(bucket_name, template_prefix)
        # 1000 is the maximum number of objects that can be deleted in a single request.
        s3_utils.objects(@templates_s3_client, bucket: bucket_name, prefix: template_prefix).each_slice(1000) do |objects|
          @templates_s3_client.delete_objects(
            bucket: bucket_name,
            delete: {
              objects: objects.map { |object| { key: object.key } },
              quiet: true
            }
          )
        end
      end

      # Copies the uploads (images, documents, etc.) of the tenant to the template
      # bucket in the template "directory". It performs a copy from S3 to S3 directly
      # without downloading the files.
      #
      # @param [String] tenant_id The ID of the tenant whose uploads will be copied.
      # @param [String] template_prefix The prefix of the template "directory" in the
      #   template bucket.
      # @param [Hash, nil] models The serialized models of the tenant. If provided, only
      #   files that are referenced in the models will be copied. Otherwise, all files
      #   will be copied.
      # @param [Integer] num_threads The number of threads to use to send copy requests
      #   to S3.
      def copy_s3_uploads(tenant_id, template_prefix, models: nil, num_threads: 20)
        source_prefix = "uploads/#{tenant_id}"
        dest_prefix = "#{template_prefix}/uploads"

        s3_utils.copy_objects(
          tenant_bucket,
          @tenant_s3_client,
          template_bucket,
          dest_s3_client: @templates_s3_client,
          prefix: source_prefix,
          num_threads: num_threads
        ) { |key| transform_key(key, dest_prefix, models: models) }
      end

      # @param [String] key The original key.
      # @param [String] prefix The new key will be prefixed with this string.
      # @param [Hash, nil] models The serialized models of the tenant.
      def transform_key(key, prefix, models: nil)
        # It is not necessary to copy the original images (= images before they are
        # resized or optimized).
        return if key.include?('/original/')

        _uploads_namespace, _tenant_id, *class_parts, attribute_name, identifier, filename = key.split('/')

        if models
          # We only copy files that are referenced in serialized models.
          model_class = class_parts.join('/').classify.constantize
          return unless models.dig('models', model_class, identifier)
        end

        [prefix, *class_parts, attribute_name, identifier, filename].join('/')
      rescue NameError
        # NameErrors are raised when the model class cannot be inferred from the key.
        # This can be caused by:
        # - some pollution in the tenant bucket (e.g., some files that were moved
        #   manually)
        # - some changes to the file path structure over time. In the past, some uploads
        #   had a different path structure that did not include the model class.
        nil
      end

      def s3_utils
        @s3_utils ||= Aws::S3::Utils.new
      end

      def template_utils
        @template_utils ||= MultiTenancy::Templates::Utils.new(s3_client: @templates_s3_client)
      end

      def template_name(tenant)
        tenant.host
      end

      # Stores the content in the S3 template bucket.
      def copy_to_s3(content, key)
        @templates_s3_client.put_object(bucket: template_bucket, key: key, body: content)
      end
    end
  end
end
