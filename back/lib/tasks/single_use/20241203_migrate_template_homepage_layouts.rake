namespace :homepage do
  desc 'Replaces legacy projects widget with new widgets on template tenants'
  task :migrate_template_homepage_layouts, [] => [:environment] do
    # Temporary way to kill logging when developing (to more closely match the production environment)
    dev_null = Logger.new('/dev/null')
    Rails.logger = dev_null
    ActiveRecord::Base.logger = dev_null

    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      puts "Checking tenant #{tenant.host}"
      next unless tenant.host.include?('template')

      puts "Updating homepage layout for tenant #{tenant.host}"

      layout = ContentBuilder::Layout.find_by(code: 'homepage')
      craftjs = layout.craftjs_json

      # All existing template tenants have the legacy projects widget, but this may be useful if we fail to update
      # all and need to re-run the script
      next unless craftjs['ROOT']['nodes'].include?('PROJECTS')

      projects_index = craftjs['ROOT']['nodes'].index('PROJECTS')
      craftjs['ROOT']['nodes'].delete_at(projects_index) # Remove the old widget name from the nodes array

      # Insert the new widget names in reverse order, at the index of the legacy projects widget
      %w[FINISHED_OR_ARCHIVED OPEN_TO_PARTICIPATION FOLLOWED_ITEMS].each do |name|
        craftjs['ROOT']['nodes'].insert(projects_index, name)
      end

      craftjs_filepath = Rails.root.join('config/homepage/default_craftjs.json.erb')
      json_craftjs_str = ERB.new(File.read(craftjs_filepath)).result(binding)
      default_craftjs = JSON.parse(json_craftjs_str)

      # Insert the new widgets' content
      craftjs['FOLLOWED_ITEMS'] = default_craftjs['FOLLOWED_ITEMS']
      craftjs['OPEN_TO_PARTICIPATION'] = default_craftjs['OPEN_TO_PARTICIPATION']
      craftjs['FINISHED_OR_ARCHIVED'] = default_craftjs['FINISHED_OR_ARCHIVED']

      craftjs.delete('PROJECTS') # Remove the old widget

      layout.update!(craftjs_json: craftjs)
    end
  end
end
