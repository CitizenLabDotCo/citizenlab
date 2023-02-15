class TemplateService
  def apply_template(template, validate: true, max_time: nil, local_copy: false)
    t1 = Time.zone.now
    obj_to_id_and_class = {}
    created_objects_ids = {}
    template['models'].each do |model_name, fields|
      unless local_copy
        LogActivityJob.perform_later(Tenant.current, 'loading_template', nil, Time.now.to_i, payload: {
          model_name: model_name,
          model_name_pluralized: model_name.pluralize
        })
      end
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
          AppConfiguration.instance.settings,
          model_class: model_class
        )

        restored_attributes.each do |field_name, field_value|
          if field_name.start_with?('remote_') && field_name.end_with?('_url') && field_name.exclude?('file')
            image_assignments[field_name] = field_value
          else
            model.send("#{field_name}=", field_value)
          end
        end

        model.skip_image_presence = true if SKIP_IMAGE_PRESENCE_VALIDATION.include?(model_class.name)

        begin
          if validate
            model.save!
          else
            model.save # Might fail but runs before_validations
            model.save(validate: false)
          end
          # taking original attributes to get correct object ID
          attributes.each do |field_name, field_value|
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
                AND table_schema = '#{Tenant.current.schema_name}'
            SQL
          ).map do |r|
            r['table_name']
          end
          json_info = {
            error_message: e.message,
            app_config_host: AppConfiguration.instance.host, # temporary for debugging
            app_config_settings: AppConfiguration.instance.settings, # temporary for debugging
            tenant_host: Tenant.current.host, # temporary for debugging
            tenant_settings: AppConfiguration.instance.settings, # temporary for debugging
            table_names: table_names, # temporary for debugging
            model_class: model_class.name,
            attributes: attributes
          }.to_json
          raise "Failed to create instance during template application: #{json_info}"
        end
        obj_to_id_and_class[attributes.object_id] = [model.id, model_class]

        created_objects_ids = update_created_objects_ids(created_objects_ids, model_class.name, model.id)
      end
    end

    DumpTenantJob.perform_later(Tenant.current) unless local_copy

    created_objects_ids
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

  def required_locales(template)
    locales = Set.new
    template['models']['user']&.each do |attributes|
      locales.add attributes['locale']
    end
    locales.to_a
  end

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
end
