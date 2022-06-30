# frozen_string_literal: true

module MultiTenancy
  class TenantTemplateService
    IMAGE_BACKGROUND_ASSIGNMENT_WHITELIST = {
      'User' => %w[remote_avatar_url],
      'Initiative' => %w[remote_header_bg_url],
      'Project' => %w[remote_header_bg_url],
      'ProjectFolders::Folder' => %w[remote_header_bg_url]
    }.freeze

    def available_templates(external_subfolder: 'release')
      template_names = {}
      template_names[:internal] = Dir[Rails.root.join('config/tenant_templates/*.yml')].map do |file|
        File.basename(file, '.yml')
      end
      if external_subfolder
        template_names[:external] =
          available_external_templates(external_subfolder: external_subfolder).select(&:present?)
      end
      template_names
    end

    def resolve_and_apply_template(template_name, external_subfolder: 'release', validate: true, max_time: nil)
      apply_template resolve_template(template_name, external_subfolder: external_subfolder), validate: validate,
        max_time: max_time
    end

    def apply_template(template, validate: true, max_time: nil)
      t1 = Time.zone.now
      obj_to_id_and_class = {}
      template['models'].each do |model_name, fields|
        LogActivityJob.perform_later(Tenant.current, 'loading_template', nil, Time.now.to_i, payload: {
          model_name: model_name,
          model_name_pluralized: model_name.pluralize
        })
        model_class = get_model_class(model_name)

        fields.each do |attributes|
          attributes ||= {} # Avoid nil. Enables an empty model field to lead to creation of record with default values.
          minutes_spent = Time.zone.now - t1
          if max_time && (minutes_spent > max_time)
            raise "Template application exceed time limit of #{max_time / 1.minute} minutes"
          end

          model = model_class.new
          image_assignments = {}

          restored_attributes = restore_template_attributes(
            attributes,
            obj_to_id_and_class,
            AppConfiguration.instance.settings
          )

          restored_attributes.each do |field_name, field_value|
            if field_name.start_with?('remote_') && field_name.end_with?('_url') && field_name.exclude?('file')
              image_assignments[field_name] = field_value
            else
              model.send("#{field_name}=", field_value)
            end
          end
          begin
            if validate
              model.save!
            else
              model.save # Might fail but runs before_validations
              model.save(validate: false)
            end
            attributes.each do |field_name, field_value| # taking original attributes to get correct object ID
              if field_name.end_with?('_attributes') && field_value.is_a?(Hash) # linking attribute refs (not supported for lists of attributes)
                submodel = model.send(field_name.chomp('_attributes'))
                obj_to_id_and_class[field_value.object_id] = [submodel.id, submodel.class]
              end
            end
            assign_images(model, image_assignments) if image_assignments.present?
          rescue Exception => e
            table_names = ActiveRecord::Base.connection.execute(
              <<-SQL.squish
                SELECT table_name
                FROM information_schema.tables
                WHERE table_type = 'BASE TABLE'
                AND table_schema = \'#{Tenant.current.schema_name}\'
              SQL
            ).map do |r|
              r['table_name']
            end
            json_info = {
              error_message: e.message,
              app_config_host: AppConfiguration.instance.host, # temporary for debugging
              app_config_settings: AppConfiguration.instance.settings, # temporary for debugging
              tenant_host: Tenant.current.host, # temporary for debugging
              tenant_settings: Tenant.current.settings, # temporary for debugging
              table_names: table_names, # temporary for debugging
              model_class: model_class.name,
              attributes: attributes
            }.to_json
            raise "Failed to create instance during template application: #{json_info}"
          end
          obj_to_id_and_class[attributes.object_id] = [model.id, model_class]
        end
      end
      nil
    end

    def restore_template_attributes(attributes, obj_to_id_and_class, app_settings)

      start_of_day = Time.now.in_time_zone(app_settings.dig('core', 'timezone')).beginning_of_day
      locales = app_settings.dig('core', 'locales')

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
            id, ref_class = obj_to_id_and_class[field_value.object_id]
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
          attributes.each do |field_name, multiloc|
            next unless (field_name =~ /_multiloc$/) && multiloc.is_a?(Hash)

            multiloc.each_key do |locale|
              locales.add locale
            end
          end
        end
      end
      template['models']['user']&.each do |attributes|
        locales.add attributes['locale']
      end
      locales.to_a
    end

    def change_locales(template, locale_from, locale_to)
      template['models'].each do |_, instances|
        instances.each do |attributes|
          attributes.each do |field_name, multiloc|
            next unless (field_name =~ /_multiloc$/) && multiloc.is_a?(Hash) && multiloc[locale_to].blank?

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
      template = resolve_template template_name, external_subfolder: external_subfolder
      locales = Set.new
      template['models']['user']&.each do |attributes|
        locales.add attributes['locale']
      end
      locales.to_a
    end

    def translate_and_fix_locales(template)
      translator = MachineTranslations::MachineTranslationService.new
      locales_to = Tenant.current.settings.dig('core', 'locales')
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
            if (field_name =~ /_multiloc$/) && field_value.is_a?(Hash)
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

    def restore_multiloc_attribute(field_value, locales)
      if field_value.is_a? String
        locales.to_h do |locale|
          translation = I18n.with_locale(locale) { I18n.t!(field_value) }
          [locale, translation]
        end
      else
        field_value.slice(*locales)
      end
    end

    def multiloc?(field_name)
      /_multiloc$/.match?(field_name)
    end

    def assign_images(model, image_assignments)
      # EDIT: Disabling for now to see if using futures offer a
      # significant improvement in speed.
      #
      # Ideally images should never be assigned in the background
      # while applying a template, so that they can be properly
      # verified and so that the tenant status doesn't turn into
      # "created", while the creation could actually still fail.
      #
      # The main reason for this change is as a quick fix so that the
      # generation of templates remains within the 3 hours execution
      # limit of CircleCI.
      #
      # This change can be reverted when the generation of templates
      # is taken out of CI or when the number and size of the
      # templates are no longer a concern.

      # allowed_atrs_for_bg_assignment = IMAGE_BACKGROUND_ASSIGNMENT_WHITELIST[model.class.name] || []
      # atrs_for_bg = image_assignments.keys & allowed_atrs_for_bg_assignment
      # atrs_not_for_bg = image_assignments.keys - allowed_atrs_for_bg_assignment
      # ImageAssignmentJob.perform_later model, image_assignments.slice(*atrs_for_bg) if atrs_for_bg.present?
      # ImageAssignmentJob.perform_now model, image_assignments.slice(*atrs_not_for_bg) if atrs_not_for_bg.present?

      ImageAssignmentJob.perform_now model, image_assignments
    end

    def get_model_class(model_name)
      legacy_class_names = {
        'ProjectFolder' => ProjectFolders::Folder,
        'ProjectFolderFile' => ProjectFolders::File,
        'ProjectFolderImage' => ProjectFolders::Image,
        'Verification::IdCard' => IdIdCardLookup::IdCard
      }

      class_name = model_name.classify
      legacy_class_names[class_name] || class_name.constantize
    end

    def available_external_templates(external_subfolder: 'release')
      s3 = Aws::S3::Resource.new client: Aws::S3::Client.new(region: 'eu-central-1')
      bucket = s3.bucket(ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates'))
      bucket.objects(prefix: external_subfolder).map(&:key).map do |template_name|
        template_name.slice! "#{external_subfolder}/"
        template_name.chomp '.yml'
      end
    end

    def resolve_template(template_name, external_subfolder: 'release')
      if template_name.is_a? String
        raise 'Unknown template' unless available_templates(external_subfolder: external_subfolder).values.flatten.uniq.include? template_name

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
  end
end
