# frozen_string_literal: true

module MultiTenancy
  class TenantTemplateService
    USER_INPUT_CLASSES = [
      Idea,
      Initiative,
      Comment
    ].to_set.freeze

    SKIP_IMAGE_PRESENCE_VALIDATION = %w[IdeaImage ContentBuilder::LayoutImage].freeze

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
      @template_service.required_locales(template)
    end

    private

    def restore_multiloc_attribute(field_value, locales)
      return field_value if field_value.blank?

      if field_value.is_a? String
        locales.to_h do |locale|
          translation = I18n.with_locale(locale) { I18n.t!(field_value) }
          [locale, translation]
        end
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
      # Images should not be assigned in the background
      # while applying a template, so that they can be properly
      # verified and so that the tenant status doesn't turn into
      # "created", while the creation could actually still fail.
      #
      # Previously, we did it in the background so that the
      # generation of templates remains within the 3 hours execution
      # limit of CircleCI.

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

    def resolve_template(template_name_or_template, external_subfolder: 'release')
      if template_name_or_template.is_a? String
        raise 'Unknown template' unless available_templates(external_subfolder: external_subfolder).values.flatten.uniq.include? template_name_or_template

        internal_path = Rails.root.join('config', 'tenant_templates', "#{template_name_or_template}.yml")
        if File.exist? internal_path
          YAML.load open(internal_path).read
        else
          s3 = Aws::S3::Resource.new client: Aws::S3::Client.new(region: 'eu-central-1')
          bucket = s3.bucket(ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates'))
          object = bucket.object("#{external_subfolder}/#{template_name_or_template}.yml")
          YAML.load object.get.body.read
        end
      elsif template_name_or_template.is_a? Hash
        template_name_or_template
      elsif template_name_or_template.nil?
        YAML.load open(Rails.root.join('config/tenant_templates/base.yml')).read
      else
        raise 'Could not resolve template'
      end
    end

    def all_supported_locales
      @all_supported_locales ||= CL2_SUPPORTED_LOCALES.map(&:to_s)
    end

    def update_created_objects_ids(created_objects_ids, model_name, model_id)
      if created_objects_ids.key?(model_name)
        created_objects_ids[model_name] << model_id
      else
        created_objects_ids[model_name] = [model_id]
      end

      created_objects_ids
    end
  end
end
