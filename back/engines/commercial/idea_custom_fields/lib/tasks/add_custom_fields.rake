namespace :setup_and_support do
  desc "Add text field to project"
  task :add_custom_fields, [:host,:project_slug,:yml_url] => [:environment] do |t, args|
    file = File.open(args[:yml_url]) { |file| YAML.load(file) }

    # uncomment for easy local use
    # file = YAML.load_file('engines/commercial/idea_custom_fields/lib/tasks/custom_fields_examples.yml')

    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      project = Project.find_by!(slug: args[:project_slug])
      custom_form = project.custom_form || CustomForm.create(project: @project)
      file["custom_fields"].each do |cf|
        CustomField.create(**cf, resource: custom_form)
      end
    end
  end

  task :disable_all_extra, [:host,:project_slug] => [:environment] do |t, args|
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      project = Project.find_by!(slug: args[:project_slug])
      custom_form = project.custom_form || CustomForm.create(project: @project)
      custom_form&.custom_fields.where(code: nil).update(enabled: false)
    end
  end
end
