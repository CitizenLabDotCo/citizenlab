class TenantTemplateService


  def available_templates
    Dir[Rails.root.join('config', 'tenant_templates', '*.yml')].map do |file|
      File.basename(file, ".yml")
    end
  end

  def apply_template template_name
    throw "Unknown template '#{template_name}'" unless available_templates.include? template_name

    file = Rails.root.join('config', 'tenant_templates', "#{template_name}.yml")
    template = YAML.load_file(file)
    template['models'].each do |model_name, fields|

      model_class = model_name.classify.constantize

      fields.each do |attributes|
        model = model_class.new
        attributes.each do |field_name, field_value|
          if (field_name =~ /_multiloc$/)
            multiloc_value = Tenant.settings('core', 'locales').map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!(field_value) }
              [locale, translation]
            end.to_h
            model.send("#{field_name}=", multiloc_value)
          else
            model.send("#{field_name}=", field_value)
          end
        end

        model.save!
      end
    end
  end

end