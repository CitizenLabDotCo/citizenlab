# frozen_string_literal: true

module MultiTenancy
  module Templates
    class Utils
      RELEASE_SPEC_FILE = 'release.json'
      MANIFEST_FILE = 'manifest.json'

      attr_reader :internal_template_dir

      delegate :parse_yml, :parse_yml_file, to: :class

      def initialize(
        internal_template_dir: Rails.root.join('config/tenant_templates'),
        template_bucket: ENV.fetch('TEMPLATE_BUCKET', nil),
        # eu-central-1 is the default region for the template bucket
        s3_client: Aws::S3::Client.new(region: 'eu-central-1')
      )
        @internal_template_dir = internal_template_dir
        @template_bucket = template_bucket
        @s3_client = s3_client
      end

      def template_manifest(prefix: release_prefix)
        int_manifest = internal_manifest
        ext_manifest = external_manifest(prefix: prefix)
        raise_if_duplicates(int_manifest.keys + ext_manifest.keys)

        int_manifest.merge(ext_manifest)
      end

      def template_names(prefix: release_prefix)
        internal_templates = internal_template_names
        external_templates = external_template_names(prefix: prefix)

        raise_if_duplicates(internal_templates + external_templates)
        (internal_templates + external_templates).sort
      end

      def internal_template_names
        template_glob = File.join(internal_template_dir, '*.yml')
        Dir[template_glob].map { |file| File.basename(file, '.yml') }
      end

      def internal_template?(template_name)
        internal_template_names.include?(template_name)
      end

      def template_prefix(template_name, prefix: release_prefix)
        "#{prefix.chomp('/')}/#{template_name}"
      end

      def external_template_names(prefix: release_prefix, ignore_manifest: false)
        unless ignore_manifest
          manifest = read_external_manifest(prefix: prefix)
          return manifest.keys if manifest
        end

        Aws::S3::Utils
          .new
          .common_prefixes(@s3_client, bucket: template_bucket, prefix: prefix, delimiter: '/models.yml')
          .map { |common_prefix| common_prefix.chomp('/models.yml').split('/').last }
          .tap { |template_names| raise_if_duplicates(template_names) }
      end

      def required_locales(template_name, external_subfolder: nil)
        serialized_models = fetch_template_models(template_name, external_subfolder: external_subfolder)
        self.class.user_locales(serialized_models)
      end

      def fetch_template_models(template_name, external_subfolder: nil)
        if internal_template?(template_name)
          fetch_internal_template_models(template_name)
        else
          external_subfolder ||= release_prefix
          fetch_external_template_models(template_name, prefix: external_subfolder)
        end
      end

      def fetch_internal_template_models(template_name)
        template_path = internal_template_dir.join("#{template_name}.yml")
        parse_yml_file(template_path)
      rescue Errno::ENOENT
        raise UnknownTemplateError, "Unknown template: '#{template_name}'."
      end

      def fetch_external_template_models(template_name, prefix: release_prefix)
        template_prefix = template_prefix(template_name, prefix: prefix)
        key = "#{template_prefix}/models.yml"
        content = @s3_client.get_object(bucket: template_bucket, key: key).body.read
        parse_yml(content)
      rescue Aws::S3::Errors::NoSuchKey
        raise UnknownTemplateError, "Unknown template: '#{template_name}'."
      end

      def release_prefix
        content = @s3_client.get_object(bucket: template_bucket, key: RELEASE_SPEC_FILE).body.read
        JSON.parse(content)['release_prefix']
      rescue Aws::S3::Errors::NoSuchKey
        nil
      end

      def test_prefix
        release_prefix = self.release_prefix
        return unless release_prefix

        release_prefix == 'blue' ? 'green' : 'blue'
      end

      # @param [String] prefix The new release prefix (the "folder" that contains the
      #   templates to be released)
      def release_templates(prefix = nil)
        prefix ||= test_prefix
        raise 'undefined release prefix' unless prefix

        manifest = external_manifest(prefix: prefix)
        @s3_client.put_object(
          bucket: template_bucket,
          key: "#{prefix.chomp('/')}/#{MANIFEST_FILE}",
          body: JSON.pretty_generate(manifest)
        )

        release_json = { release_prefix: prefix }
        @s3_client.put_object(
          bucket: template_bucket,
          key: RELEASE_SPEC_FILE,
          body: release_json.to_json
        )

        prefix
      end

      def template_bucket
        @template_bucket ||= raise ArgumentError, 'template_bucket parameter has not been specified'
      end

      # Removes all the file in the template bucket that start with the test prefix.
      def clear_test_templates
        Aws::S3::Utils.new.delete_objects(
          template_bucket,
          @s3_client,
          prefix: test_prefix
        )
      end

      def external_manifest(prefix: release_prefix)
        read_external_manifest(prefix: prefix) || compute_external_manifest(prefix: prefix)
      end

      def read_external_manifest(prefix: release_prefix)
        manifest_key = "#{prefix.chomp('/')}/#{MANIFEST_FILE}"
        manifest = @s3_client.get_object(bucket: template_bucket, key: manifest_key).body.read
        JSON.parse(manifest)
      rescue Aws::S3::Errors::NoSuchKey
        nil
      end

      def compute_external_manifest(prefix: release_prefix)
        template_names = external_template_names(prefix: prefix, ignore_manifest: true)

        template_names.index_with do |template_name|
          serialized_models = fetch_external_template_models(template_name, prefix: prefix)
          { required_locales: self.class.user_locales(serialized_models) }
        end
      end

      def internal_manifest
        internal_template_names.index_with do |template_name|
          serialized_models = fetch_internal_template_models(template_name)
          { required_locales: self.class.user_locales(serialized_models) }
        end
      end

      class << self
        def change_locales(serialized_models, locale_from, locale_to)
          serialized_models['models'].each_value do |instances|
            instances.each do |attributes|
              attributes.each do |field_name, multiloc|
                next unless multiloc?(field_name) && multiloc.is_a?(Hash) && multiloc[locale_to].blank?

                multiloc[locale_to] = if locale_from.blank?
                  multiloc.values.first
                else
                  multiloc[locale_from]
                end
              end
            end
          end

          serialized_models.dig('models', 'user')&.each do |attributes|
            attributes['locale'] = locale_to
          end

          serialized_models
        end

        def translate_and_fix_locales(serialized_models)
          translator = MachineTranslations::MachineTranslationService.new
          locales_to = AppConfiguration.instance.settings('core', 'locales')

          # Log number of translations to help monitor costs.
          translate_logs = { models: {}, strings: 0, chars: 0 }

          # Do the locales in the template already match the target locales?
          return [serialized_models, translate_logs] if Set.new(locales_to) == Set.new(template_locales(serialized_models))

          # Change unsupported user locales to first target tenant locale.
          # Only keep the bio if the locale is supported by the target - to reduce translation costs.
          unless Set.new(locales_to) == Set.new(user_locales(serialized_models))
            serialized_models['models']['user']&.each do |attributes|
              unless locales_to.include? attributes['locale']
                attributes['locale'] = locales_to.first
                attributes['bio_multiloc'].select! { |key, _| locales_to.include?(key) }
              end
            end
          end

          # Translate any missing locales from the first locale found.
          serialized_models['models'].each do |model_name, model|
            next if model_name == 'user' # Users have been handled above and do not have translations

            model.each do |attributes|
              model_has_been_logged = false
              attributes.each do |field_name, field_value|
                if multiloc?(field_name) && field_value.is_a?(Hash)
                  source_locale = field_value.keys.first
                  next unless source_locale

                  # log the model being translated
                  translate_logs[:models][model_name] ||= 0
                  translate_logs[:models][model_name] += 1 unless model_has_been_logged
                  model_has_been_logged = true

                  source_text = field_value[source_locale]
                  locales_to.each do |locale|
                    next if field_value.key?(locale) && field_value[locale].present?

                    begin
                      field_value[locale] = if source_text.blank?
                        source_text
                      else
                        translate_logs[:strings] += 1
                        translate_logs[:chars] += source_text.length
                        translator.translate source_text, source_locale, locale, retries: 10
                      end
                    rescue StandardError => e
                      ErrorReporter.report(e, extra: { model: model_name, field: field_name, from: source_locale, to: locale, text: source_text })
                    end
                  end

                  # Only keep the target locales
                  field_value.select! { |key, _| locales_to.include?(key) }

                  attributes[field_name] = field_value
                end
              end
            end
          end

          [serialized_models, translate_logs]
        end

        def user_locales(serialized_models)
          serialized_models = serialized_models.with_indifferent_access

          # Support both formats of serialized models.
          users =
            serialized_models.dig('models', 'user').presence ||
            serialized_models.dig('models', User)&.values ||
            []

          users.pluck('locale').uniq.sort
        end

        def parse_yml(content)
          # [TODO] Ideally, we should use `YAML.load` instead of `YAML.unsafe_load`.
          # Currently, the tenant templates contain references to ActiveRecord model
          # classes. If we were to use `YAML.load`, we would need to provide a whitelist
          # of classes that are allowed to be deserialized. The list can be obtained by
          # calling `ApplicationRecord.descendants`, but the application has to be eager
          # loaded for this to return the complete list. The eager loading is causing
          # issues in some CI workflows where the DB is not completely set up. Therefore,
          # we resort to `YAML.unsafe_load` for now.
          # One possible solution would be to rework the template format to encode AR
          # model class names as strings instead of actual class references.
          YAML.unsafe_load(content)
        end
        alias parse_yaml parse_yml

        def parse_yml_file(file)
          content = File.read(file)
          parse_yml(content)
        end
        alias parse_yaml_file parse_yml_file

        private

        def template_locales(serialized_models)
          locales = Set.new

          serialized_models['models'].each_value do |instances|
            instances.each do |attributes|
              attributes.each do |name, value|
                next unless multiloc?(name) && value.is_a?(Hash)

                locales.merge(value.keys)
              end
            end
          end

          locales.merge(user_locales(serialized_models))
          locales.to_a
        end

        def multiloc?(attribute_name)
          /_multiloc$/.match?(attribute_name)
        end
      end

      private

      def raise_if_duplicates(template_names)
        duplicates = template_names.group_by(&:itself)
          .transform_values(&:count)
          .select { |_, count| count > 1 }

        raise AmbiguousTemplateNames, <<~MSG if duplicates.any?
          #{duplicates.map { |name, count| "#{name} (#{count}x)" }.join(', ')}.
        MSG
      end

      class AmbiguousTemplateNames < StandardError; end
      class UnknownTemplateError < StandardError; end
    end
  end
end
