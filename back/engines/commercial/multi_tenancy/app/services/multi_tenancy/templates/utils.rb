# frozen_string_literal: true

module MultiTenancy
  module Templates
    class Utils
      attr_reader :internal_template_dir, :template_bucket

      def initialize(
        internal_template_dir: Rails.root.join('config/tenant_templates'),
        template_bucket: ENV.fetch('TEMPLATE_BUCKET'),
        s3_client: Aws::S3::Client.new(region: 'eu-central-1')
      )
        @internal_template_dir = internal_template_dir
        @template_bucket = template_bucket
        @s3_client = s3_client
      end

      def available_templates(external_prefix: 'release')
        templates = available_internal_templates
        templates += available_external_templates(prefix: "#{external_prefix}/") if external_prefix
        raise_if_duplicates(templates)

        templates.sort
      end

      def available_internal_templates
        template_glob = File.join(internal_template_dir, '*.yml')
        Dir[template_glob].map { |file| File.basename(file, '.yml') }
      end

      def internal_template?(template_name)
        available_internal_templates.include?(template_name)
      end

      def template_prefix(template_name, prefix: 'release')
        "#{prefix.chomp('/')}/#{template_name}"
      end

      def available_external_templates(prefix: 'release/')
        Aws::S3::Utils
          .new(@s3_client)
          .common_prefixes(bucket: template_bucket, prefix: prefix, delimiter: '/models.yml')
          .map { |common_prefix| common_prefix.chomp('/models.yml').split('/').last }
          .tap { |template_names| raise_if_duplicates(template_names) }
      end

      def required_locales(template_name, external_subfolder: 'release')
        serialized_models = fetch_template_models(template_name, external_subfolder: external_subfolder)
        self.class.user_locales(serialized_models)
      end

      def fetch_template_models(template_name, external_subfolder: 'release')
        if internal_template?(template_name)
          fetch_internal_template_models(template_name)
        else
          fetch_external_template_models(template_name, prefix: external_subfolder)
        end
      end

      def fetch_internal_template_models(template_name)
        template_path = internal_template_dir.join("#{template_name}.yml")
        parse_yml(File.read(template_path))
      end

      def fetch_external_template_models(template_name, prefix: 'release')
        template_prefix = template_prefix(template_name, prefix: prefix)
        key = "#{template_prefix}/models.yml"
        content = @s3_client.get_object(bucket: template_bucket, key: key).body.read
        parse_yml(content)
      end

      class << self
        def change_locales(serialized_models, locale_from, locale_to)
          serialized_models['models'].each do |_, instances|
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
          return serialized_models if Set.new(template_locales(serialized_models)).subset? Set.new(locales_to)

          locales_from = user_locales(serialized_models)
          # Change unsupported user locales to first target tenant locale.
          unless Set.new(locales_from).subset? Set.new(locales_to)
            serialized_models['models']['user']&.each do |attributes|
              unless locales_to.include? attributes['locale']
                attributes['locale'] = locales_to.first
              end
            end
          end
          # Determine if translation needs to happen.
          translate_from = locales_from.first
          translate_to = locales_to.include?(translate_from) ? nil : locales_to.first
          # Change multiloc fields, applying translation and removing
          # unsupported locales.
          serialized_models['models'].each do |_model_name, fields|
            fields.each do |attributes|
              attributes.each do |field_name, field_value|
                if multiloc?(field_name) && field_value.is_a?(Hash)
                  if (field_value.keys & locales_to).blank? && !field_value.key?(translate_from) && field_value.present?
                    other_translate_from = field_value.keys.first
                    other_translate_to = translate_to || locales_to.first
                    translation = translator.translate field_value[other_translate_from], other_translate_from,
                      other_translate_to, retries: 10
                    attributes[field_name] = { translate_to => translation }
                  else
                    field_value.each_key do |locale|
                      if locale == translate_from && translate_to
                        field_value[locale] = translator.translate field_value[locale], locale, translate_to, retries: 10
                      elsif locales_to.exclude?(locale)
                        field_value.delete locale
                      end
                    end
                  end
                end
              end
            end
          end
          # Cut off translations that are too long.
          {
            'project' => { 'description_preview_multiloc' => 280 },
            'idea' => { 'title_multiloc' => 80 }
          }.each do |model, restrictions|
            serialized_models['models'][model]&.each do |attributes|
              restrictions.each do |field_name, max_len|
                multiloc = attributes[field_name]
                multiloc.each do |locale, value|
                  multiloc[locale] = value[0...max_len] if value.size > max_len
                end
              end
            end
          end
          serialized_models
        end

        def user_locales(serialized_models)
          serialized_models
            .dig('models', 'user')
            .to_a # convert to array if nil
            .pluck('locale').uniq
        end

        private

        def template_locales(serialized_models)
          locales = Set.new

          serialized_models['models'].each do |_, instances|
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

      def parse_yml(content)
        # We have to use YAML.load because templates use yaml aliases.
        YAML.load(content) # rubocop:disable Security/YAMLLoad
      end

      def raise_if_duplicates(template_names)
        duplicates = template_names.group_by(&:itself)
                                   .transform_values(&:count)
                                   .select { |_, count| count > 1 }

        raise AmbiguousTemplateNames, <<~MSG if duplicates.any?
          #{duplicates.map { |name, count| "#{name} (#{count}x)" }.join(', ')}.
        MSG
      end

      class AmbiguousTemplateNames < StandardError; end
    end
  end
end
