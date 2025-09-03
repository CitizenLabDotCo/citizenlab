# Version of task in setup_and_support.rake to fit the needs a specific ticket:
# TAN-3437 Schagen - SLS - Bulk importing custom registration fields

namespace :postcodes do
  desc 'Adds a list of custom field options to the specified custom field & reorders all alphabetically'
  task :add_custom_field_options, %i[host url id locale] => [:environment] do |_t, args|
    options = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      locale = args[:locale] || AppConfiguration.instance.settings.dig('core', 'locales').first
      cf = CustomField.find args[:id]
      options.each { |option| cf.options.find_or_create_by!(title_multiloc: { locale => option }) }

      cfos = CustomFieldOption.where(custom_field_id: cf.id)

      # Sort the collection in memory based on the title_multiloc[locale] values
      sorted_cfos = cfos.sort_by { |cfo| cfo.title_multiloc[locale].downcase }

      # Iterate over the sorted collection and use move_to_bottom to reorder them
      sorted_cfos.each(&:move_to_bottom)

      puts 'Custom field options reordered successfully.'
    end
  end
end
