# frozen_string_literal: true

module MultiTenancy
  module Templates
    # This class is exclusively responsible for reconstructing DB records from hashes of
    # serialized models (such as those produced by the tenant serializer). This class is
    # and should remain agnostic of the storage backend used for storing the templates
    # and serialized models. It's also not concerned with the uploads that are part of
    # the template.
    class TenantDeserializer
      USER_INPUT_CLASSES = [
        Idea,
        Initiative,
        Comment
      ].to_set.freeze

      SKIP_IMAGE_PRESENCE_VALIDATION = %w[IdeaImage ContentBuilder::LayoutImage].freeze

      def initialize(save_temp_remote_urls: false)
        @save_temp_remote_urls = save_temp_remote_urls
      end

      def deserialize(template, validate: true, max_time: nil, local_copy: false)
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
            _deserialize(template, validate, max_time, local_copy)
          end
        end

        # check_inconsistent_data! if validate # TODO: Re-enable after fixing inconsistent data on templates.
      end

      private

      def _deserialize(template, validate, max_time, local_copy)
        t1 = Time.zone.now
        obj_to_id_and_class = {}.compare_by_identity
        created_objects_ids = Hash.new { |h, k| h[k] = [] } # Hash with empty arrays as default values

        template['models'].each do |model_name, records|
          unless local_copy
            LogActivityJob.perform_later(Tenant.current, 'loading_template', nil, Time.now.to_i, payload: {
              model_name: model_name,
              model_name_pluralized: model_name.pluralize
            })
          end

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

            remote_image_attributes, restored_attributes = restored_attributes.partition do |field_name, _field_value|
              field_name.start_with?('remote_') && field_name.end_with?('_url') && field_name.exclude?('file')
            end.map(&:to_h)

            model = model_class.new(restored_attributes)
            model.skip_image_presence = true if SKIP_IMAGE_PRESENCE_VALIDATION.include?(model_class.name)

            begin
              preserve_ordering(model) { save_model(model, validate) }

              # Only upload attributes that are strings are copied verbatim using
              # `update_columns` to bypass the CarrierWave uploader.
              str_upload_attributes = restored_attributes
                .slice(*uploaders_names)
                .select { |_, v| v.is_a?(String) }
              model.update_columns(str_upload_attributes) if str_upload_attributes.present?

              # Assign images that were serialized as remote URLs (`remote_*_url`).
              assign_images(model, remote_image_attributes) if remote_image_attributes.present?

              # taking original attributes to get correct object ID
              attributes.each do |field_name, field_value|
                if field_name.end_with?('_attributes') && field_value.is_a?(Hash) # linking attribute refs (not supported for lists of attributes)
                  submodel = model.send(field_name.chomp('_attributes'))
                  obj_to_id_and_class[field_value] = [submodel.id, submodel.class]
                end
              end
            rescue StandardError => e
              json_info = {
                error_message: e.message,
                model_class: model_class.name,
                attributes: attributes,
                error_backtrace: e.backtrace
              }.to_json
              message = "Failed to create instance during template application: #{json_info}"
              ErrorReporter.report_msg(message)
              raise message
            end

            obj_to_id_and_class[attributes] = [model.id, model_class]
            created_objects_ids[model_class.name] << model.id
          end
        end

        created_objects_ids
      end

      def restore_template_attributes(attributes, obj_to_id_and_class, app_settings, model_class: nil)
        start_of_day = AppConfiguration.timezone.now.beginning_of_day
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
              id, ref_class = obj_to_id_and_class.fetch(field_value)
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

      def all_supported_locales
        @all_supported_locales ||= CL2_SUPPORTED_LOCALES.map(&:to_s)
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

      def preserve_ordering(model, &)
        if model.try(:in_list?)
          model.class.acts_as_list_no_update(&)
        else
          yield
        end
      end

      def save_model(model, validate)
        if validate
          model.save!
        else
          model.save # Might fail but runs before_validations
          model.save(validate: false)
        end
      end

      def check_inconsistent_data!
        summary = InvalidDataChecker.new.check_tenant
        raise "Inconsistent data after template application: #{summary[:issues]}" if summary[:issues].present?
      end
    end
  end
end
