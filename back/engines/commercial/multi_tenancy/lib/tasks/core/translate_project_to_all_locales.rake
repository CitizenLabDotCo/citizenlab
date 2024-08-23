namespace :cl2_back do
  # This task translates all the multiloc attributes of the project and many of its related records
  # to all the tenant locales.
  #
  # It specifically processes all multilocs for the project, and its phases,
  # including; survey custom_fields & related custom_field_options, and report layouts.
  # When related reports exist, it will re-publish the graph_data_units for each report to update
  # any multilocs they may contain.
  #
  # It assumes that correct English (en) values are present in all the multilocs to be processed,
  # and machine translates these to all other multiloc keys in use by the tenant.
  # It also assumes a user with email 'moderator@citizenlab.co' or 'moderator@govocal.com' exists.
  #
  # It will overwrite any existing translations.
  desc 'Translate project multilocs to all tenant locales'
  task :translate_project_to_tenant_locales, %i[host project_id] => :environment do |_t, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      project = Project.find(args[:project_id])
      locales = AppConfiguration.instance.settings['core']['locales']
      translate_project = TranslateProjectMethods.new

      puts "\nTranslating project: '#{project.title_multiloc['en']}' to all tenant locales\n\n"

      translate_project.process_model(project, locales)

      project.phases.each do |phase|
        translate_project.process_model(phase, locales)

        fields = phase&.custom_form&.custom_fields
        fields&.each do |field|
          translate_project.process_model(field, locales)
          options = field&.options
          options&.each { |option| translate_project.process_model(option, locales) }
        end

        report = phase&.report
        layout = report&.layout
        translate_project.process_layout(layout, locales) if layout
        translate_project.process_data_units(report) if report
      end

      puts "\n--- end ---\n\n"
    end
  end
end

class TranslateProjectMethods
  def process_model(model, locales)
    multiloc_attributes = model.attributes.select { |attribute| attribute.ends_with? '_multiloc' }

    multiloc_attributes.each do |multiloc_attribute|
      attribute_name = multiloc_attribute[0]
      translated = process_multiloc(multiloc_attribute[1], locales)
      next unless translated

      model[attribute_name] = translated
    end

    save_model(model)
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

    save_model(layout)
  end

  def process_data_units(report)
    user = User.admin.first

    if user.blank?
      puts "No moderator user found, so could not re-publish graph_data_units for Report: #{report.id}"
      nil
    end

    ReportBuilder::ReportPublisher.new(report, user).publish

    puts "Re-published graph_data_units for Report: #{report.id}"
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

  def save_model(model)
    return unless model.changed?

    if model.save
      puts "Processed #{model.class} #{model.id}"
    else
      puts "Failed to save #{model.class} #{model.id}"
      pp model.errors
    end
  end
end
