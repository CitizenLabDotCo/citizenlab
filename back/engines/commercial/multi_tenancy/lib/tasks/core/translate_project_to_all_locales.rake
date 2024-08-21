namespace :cl2_back do
  # This task translates all the multiloc attributes of the project and many of its related records
  # to all the tenant locales.
  # It assumes that correct English (en) values are present in all the multilocs to be processed,
  # and machine translates these to all other multiloc keys in use by the tenant.
  # It will overwrite any existing translations.
  # It specifically copies multilocs for the project, phases, survey custom_fields & related custom_field_options,
  # and reports.
  desc 'Translate project multilocs to all tenant locales'
  task :translate_project_to_tenant_locales, %i[host project_id] => :environment do |_t, args|
    # Temporary way to kill logging when developing (to more closely match the production environment)
    dev_null = Logger.new('/dev/null')
    Rails.logger = dev_null
    ActiveRecord::Base.logger = dev_null

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      project = Project.find(args[:project_id])
      locales = AppConfiguration.instance.settings['core']['locales']

      puts "\nTranslating project #{project.title_multiloc['en']} to all tenant locales\n\n"

      process_all_multilocs(project, locales)

      project.phases.each do |phase|
        # fields = phase&.custom_form&.custom_fields
        # fields&.each do |field|
        #   process_all_multilocs(field, locales)
        #   options = field&.options
        #   options&.each { |option| process_all_multilocs(option, locales) }
        # end

        layout = phase&.report&.layout
        process_layout(layout, locales) if layout
      end

      puts "--- end ---\n\n"
    end
  end
end

def process_all_multilocs(model, locales)
  multiloc_attributes = model.attributes.select { |attribute| attribute.ends_with? '_multiloc' }

  multiloc_attributes.each do |multiloc_attribute|
    attribute_name = multiloc_attribute[0]
    translated = process_multiloc(multiloc_attribute[1], locales)
    next unless translated

    model[attribute_name] = translated
  end

  pp model
end

def process_multiloc(multiloc, locales)
  english = multiloc['en']
  return nil unless english

  translator = MachineTranslations::MachineTranslationService.new

  locales.each do |locale|
    next if locale == 'en'

    multiloc[locale] = translator.translate(english, 'en', locale)
  end

  multiloc
end

def process_layout(layout, locales)
  craftjs_json = layout.craftjs_json

  craftjs_json.each do |k, v|
    next unless v.is_a?(Hash)

    text = v.dig('props', 'text')
    next unless text.is_a?(Hash) && text['en'].present?

    craftjs_json[k]['props']['text'] = process_multiloc(text, locales)
  end

  layout.craftjs_json = craftjs_json
  pp layout
end
