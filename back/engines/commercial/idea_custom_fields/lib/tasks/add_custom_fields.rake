# frozen_string_literal: true

namespace :cl2back do
  desc 'Add an extra idea form field'
  task :add_extra_field, %i[host project title description input_type required] => [:environment] do |_t, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      locale = AppConfiguration.instance.settings.dig('core', 'locales').first
      project = Project.find args[:project]
      custom_form = project.custom_form || CustomForm.create!(project: project)
      CustomField.create!(
        resource: custom_form,
        title_multiloc: { locale => args[:title] },
        description_multiloc: { locale => args[:description] },
        input_type: args[:input_type],
        required: ActiveModel::Type::Boolean.new.cast(args[:required]),
        enabled: true
      )
    end
  end
end
