class TenantTemplateService


  def available_templates
    Dir[Rails.root.join('config', 'tenant_templates', '*.yml')].map do |file|
      File.basename(file, ".yml")
    end
  end


  def apply_template template_name, is_path=false
    template = resolve_template(template_name, is_path)
    obj_to_inst = {}
    template['models'].each do |model_name, fields|

      model_class = model_name.classify.constantize

      fields.each do |attributes|
        model = model_class.new
        attributes.each do |field_name, field_value|
          if (field_name =~ /_multiloc$/) && (field_value.is_a? String)
            multiloc_value = I18n.available_locales.map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!(field_value) }
              [locale, translation]
            end.to_h
            model.send("#{field_name}=", multiloc_value)
          elsif field_name.end_with? '_ref'
            model.send("#{field_name.chomp '_ref'}=", obj_to_inst[field_value])
          else
            model.send("#{field_name}=", field_value)
          end
        end
        begin 
          model.save!
        rescue Exception => e
          if e.message == "Validation failed: Avatar could not download file: 404 Not Found"
            # e.message = e.message + ": #{model.email} + #{template_name}" ### doesn't work
          end
          raise e
        end
        obj_to_inst[attributes] = model
      end
    end
  end

  private
  
  def resolve_template template_name, is_path=false
    if is_path
      YAML.load_file(template_name)
    elsif template_name.kind_of? String
      throw "Unknown template '#{template_name}'" unless available_templates.include? template_name
      YAML.load_file(Rails.root.join('config', 'tenant_templates', "#{template_name}.yml"))
    elsif template_name.kind_of? Hash
      template_name
    elsif template_name.nil?
      YAML.load_file(Rails.root.join('config', 'tenant_templates', "base.yml"))
    else
      throw "Could not resolve template"
    end
  end
end
