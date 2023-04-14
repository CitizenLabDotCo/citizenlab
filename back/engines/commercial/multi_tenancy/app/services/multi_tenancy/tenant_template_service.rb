# frozen_string_literal: true

module MultiTenancy
  class TenantTemplateService
    USER_INPUT_CLASSES = [
      Idea,
      Initiative,
      Comment
    ].to_set.freeze

    SKIP_IMAGE_PRESENCE_VALIDATION = %w[IdeaImage ContentBuilder::LayoutImage].freeze

    def initialize(save_temp_remote_urls: false)
      @save_temp_remote_urls = save_temp_remote_urls
    end

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

    def resolve_and_apply_template(
      template_name,
      external_subfolder: 'release',
      validate: true,
      max_time: nil,
      local_copy: false
    )
      Rails.logger.tagged('loading template', template_name: template_name) do
        apply_template(
          resolve_template(template_name, external_subfolder: external_subfolder),
          validate: validate,
          max_time: max_time,
          local_copy: local_copy
        )
      end
    end

    def apply_template(...)
      # To ensure that `CurrentAttributes` is not unexpectedly reset during the
      # application of a template, we need to make sure that the template is wrapped by
      # the executor before setting the `CurrentAttributes` value. This is because
      # `Rails.application.executor.wrap` is called during template application (e.g.,
      # when enqueuing jobs). If the block is not already wrapped, the executor
      # callbacks will be run early and reset the `CurrentAttributes`.
      #
      # In some cases, the code that calls `apply_template` is automatically wrapped
      # (such as when handling a request), but this is not the case when using the Rails
      # console or running Rake tasks.
      #
      # Note: It's safe to call wrap multiple times because the executor is re-entrant.
      ::Rails.application.executor.wrap do
        Current.set(loading_tenant_template: true) do
          _apply_template(...)
        end
      end
    end

    def restore_template_attributes(attributes, obj_to_id_and_class, app_settings, model_class: nil)
      start_of_day = Time.now.in_time_zone(app_settings.dig('core', 'timezone')).beginning_of_day
      locales = USER_INPUT_CLASSES.include?(model_class) ? app_settings.dig('core', 'locales') : all_supported_locales

      new_attributes = {}
      attributes.each do |field_name, field_value|
        if multiloc?(field_name)
          new_attributes[field_name] = restore_multiloc_attribute(field_value, locales)

        elsif field_name.end_with?('_attributes') && field_value.is_a?(Hash)
          new_attributes[field_name] = restore_template_attributes(field_value, obj_to_id_and_class, app_settings)

        elsif field_name.end_with?('_attributes') && field_value.is_a?(Array) && field_value.all?(Hash)
          new_attributes[field_name] = field_value.map do |value|
            restore_template_attributes(value, obj_to_id_and_class, app_settings)
          end

        elsif field_name.end_with?('_ref')
          ref_suffix = field_name.end_with?('_attributes_ref') ? '_attributes_ref' : '_ref' # linking attribute refs
          if field_value
            id, ref_class = obj_to_id_and_class.fetch(field_value.object_id)
            new_attributes[field_name.chomp(ref_suffix)] = ref_class.find(id)
          end

        elsif field_name.end_with?('_timediff')
          if field_value.is_a?(Numeric)
            time = start_of_day + field_value.hours
            new_attributes[field_name.chomp('_timediff')] = time
          end

        else
          new_attributes[field_name] = field_value
        end
      end

      # Required to make templates tests work in which case file storage is used
      if Rails.env.test?
        keys = new_attributes.keys.select do |key|
          key.start_with?('remote_') && key.end_with?('_url') && new_attributes[key]&.start_with?('/')
        end
        keys.each do |key|
          new_key = key.gsub('remote_', '').gsub('_url', '')
          new_attributes[new_key] = File.open "public#{new_attributes[key]}"
          new_attributes.delete key
        end
      end

      new_attributes
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

    private

    def _apply_template(template, validate: true, max_time: nil, local_copy: false)
      t1 = Time.zone.now
      obj_to_id_and_class = {}
      created_objects_ids = Hash.new { |h, k| h[k] = [] } # Hash with empty arrays as default values

      template['models'].each do |model_name, records|
        # unless local_copy
        #   LogActivityJob.perform_later(Tenant.current, 'loading_template', nil, Time.now.to_i, payload: {
        #     model_name: model_name,
        #     model_name_pluralized: model_name.pluralize
        #   })
        # end

        model_class = model_name.classify.constantize
        uploaders_names = model_class.uploaders.keys.map(&:to_s)

        records.each do |attributes|
          minutes_spent = Time.zone.now - t1
          if max_time && (minutes_spent > max_time)
            raise "Template application exceed time limit of #{max_time / 1.minute} minutes"
          end

          attributes ||= {} # Avoid nil. Enables an empty model field to lead to creation of record with default values.
          restored_attributes = restore_template_attributes(
            attributes,
            obj_to_id_and_class,
            AppConfiguration.instance.settings,
            model_class: model_class
          )

          image_assignments, restored_attributes = restored_attributes.partition do |field_name, _field_value|
            field_name.start_with?('remote_') && field_name.end_with?('_url') && field_name.exclude?('file')
          end.map(&:to_h)

          model = model_class.new(restored_attributes)
          model.skip_image_presence = true if SKIP_IMAGE_PRESENCE_VALIDATION.include?(model_class.name)

          begin
            if model.try(:in_list?)
              model.class.acts_as_list_no_update { save_model(model, validate) }
            else
              save_model(model, validate)
            end

            upload_attributes = restored_attributes.slice(*uploaders_names)
            model.update_columns(upload_attributes) if upload_attributes.present?
            assign_images(model, image_assignments) if image_assignments.present?

            # taking original attributes to get correct object ID
            attributes.each do |field_name, field_value|
              if field_name.end_with?('_attributes') && field_value.is_a?(Hash) # linking attribute refs (not supported for lists of attributes)
                submodel = model.send(field_name.chomp('_attributes'))
                obj_to_id_and_class[field_value.object_id] = [submodel.id, submodel.class]
              end
            end
          rescue StandardError => e
            json_info = {
              error_message: e.message,
              model_class: model_class.name,
              attributes: attributes
            }.to_json
            raise "Failed to create instance during template application: #{json_info}"
          end

          obj_to_id_and_class[attributes.object_id] = [model.id, model_class]
          created_objects_ids[model_class.name] << model.id
        end
      end

      DumpTenantJob.perform_later(Tenant.current) unless local_copy

      created_objects_ids
    end

    def restore_multiloc_attribute(field_value, locales)
      return field_value if field_value.blank?

      if field_value.is_a? String
        locales.index_with { |locale| I18n.with_locale(locale) { I18n.t!(field_value) } }
      else
        multiloc = field_value.slice(*locales)

        if multiloc.empty?
          Rails.logger.warn('locales missing in multiloc', template_multiloc: field_value, locales: locales)
          multiloc = field_value.slice(field_value.keys.first)
        end

        multiloc
      end
    end

    def multiloc?(field_name)
      /_multiloc$/.match?(field_name)
    end

    def assign_images(model, image_assignments)
      if @save_temp_remote_urls
        CarrierwaveTempRemote.save_urls(model, image_assignments)
      else
        # Images should not be assigned in the background
        # while applying a template, so that they can be properly
        # verified and so that the tenant status doesn't turn into
        # "created", while the creation could actually still fail.
        #
        # Previously, we did it in the background so that the
        # generation of templates remains within the 3 hours execution
        # limit of CircleCI.
        model.update!(image_assignments)
      end
    end

    def resolve_template(template_name, external_subfolder: 'release')
      if template_name.is_a? String
        raise 'Unknown template' unless available_templates(external_prefix: external_subfolder).include?(template_name)

        internal_path = Rails.root.join('config', 'tenant_templates', "#{template_name}.yml")
        if File.exist? internal_path
          YAML.load open(internal_path).read
        else
          s3 = Aws::S3::Resource.new client: Aws::S3::Client.new(region: 'eu-central-1')
          bucket = s3.bucket(ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates'))
          object = bucket.object("#{external_subfolder}/#{template_name}.yml")
          YAML.load object.get.body.read
        end
      elsif template_name.is_a? Hash
        template_name
      elsif template_name.nil?
        YAML.load open(Rails.root.join('config/tenant_templates/base.yml')).read
      else
        raise 'Could not resolve template'
      end
    end

    def all_supported_locales
      @all_supported_locales ||= CL2_SUPPORTED_LOCALES.map(&:to_s)
    end

    def save_model(model, validate)
      if validate
        model.save!
      else
        model.save # Might fail but runs before_validations
        model.save(validate: false)
      end
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
