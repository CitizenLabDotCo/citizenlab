# frozen_string_literal: true

module MultiTenancy
  module Templates
    class Utils

      def available_templates(external_prefix: 'release')
        templates = available_internal_templates
        templates += available_external_templates(prefix: "#{external_prefix}/") if external_prefix
        raise_if_duplicates(templates)

        templates.sort
      end

      def available_internal_templates(dir_path: Rails.root.join('config/tenant_templates/*.yml'))
        Dir[dir_path].map { |file| File.basename(file, '.yml') }
      end

      def available_external_templates(
        s3_client: Aws::S3::Client.new(region: 'eu-central-1'),
        bucket: ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates'),
        prefix: 'release/'
      )
        Aws::S3::Utils
          .new(s3_client)
          .common_prefixes(bucket: bucket, prefix: prefix, delimiter: '/models.yml')
          .map { |common_prefix| common_prefix.chomp('/models.yml').split('/').last }
          .tap { |template_names| raise_if_duplicates(template_names) }
      end

      def template_locales(template)
        locales = Set.new

        template['models'].each do |_, instances|
          instances.each do |attributes|
            attributes.each do |field_name, attribute|
              next unless multiloc?(field_name) && attribute.is_a?(Hash)

              locales.merge(attribute.keys)
            end
          end
        end

        locales.merge(user_locales(template))
        locales.to_a
      end

      def change_locales(template, locale_from, locale_to)
        template['models'].each do |_, instances|
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
        template['models']['user']&.each do |attributes|
          attributes['locale'] = locale_to
        end
        template
      end

      def required_locales(template_name, external_subfolder: 'release')
        template = resolve_template(template_name, external_subfolder: external_subfolder)
        template.dig('models', 'user').to_a.pluck('locale').uniq
      end

      alias user_locales required_locales

      def translate_and_fix_locales(template)
        translator = MachineTranslations::MachineTranslationService.new
        locales_to = AppConfiguration.instance.settings('core', 'locales')
        return template if Set.new(template_locales(template)).subset? Set.new(locales_to)

        locales_from = required_locales template
        # Change unsupported user locales to first target tenant locale.
        unless Set.new(locales_from).subset? Set.new(locales_to)
          template['models']['user']&.each do |attributes|
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
        template['models'].each do |_model_name, fields|
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
          template['models'][model]&.each do |attributes|
            restrictions.each do |field_name, max_len|
              multiloc = attributes[field_name]
              multiloc.each do |locale, value|
                multiloc[locale] = value[0...max_len] if value.size > max_len
              end
            end
          end
        end
        template
      end


      def all_supported_locales
        @all_supported_locales ||= CL2_SUPPORTED_LOCALES.map(&:to_s)
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
    end
  end
end