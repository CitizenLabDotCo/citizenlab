# frozen_string_literal: true

# Task for migrating from separate custom field into domicile for Almere (TAN-7514)
namespace :single_use do
  desc 'Map in_welk_stadsdeel_woon_je custom field values in stadsgesprekken.almere.nl to domicile'
  task map_customfield_to_domicile: :environment do |_task|
    reporter = ScriptReporter.new

    # Data mappings
    host = 'stadsgesprekken.almere.nl'
    field_name = 'in_welk_stadsdeel_woon_je'
    field_values_to_domicile = {
      'Buiten' => 'e9332567-ab68-44df-85e6-2cdbb64e522f',
      'Haven' => '0c46a763-ebc6-44d4-8676-eb87532213c7',
      'Hout' => '7886ff39-2909-49ef-932d-c3cecada3de7',
      'Poort' => '63263fc2-f358-4756-b288-782d0b2daeaf',
      'Stadcentrum' => '98ac5606-8f17-41b0-b66e-61420ee48334',
      'Stadoost' => '657b8a51-e267-401f-8ee9-08e5f7089c68',
      'Stadwest' => '657b8a51-e267-401f-8ee9-08e5f7089c68'
    }

    Tenant.find_by(host:).switch do
      User.where("custom_field_values ? '#{field_name}'").find_each do |user|
        stadsdeel_value = user.custom_field_values[field_name]
        domicile_id = field_values_to_domicile[stadsdeel_value]

        next if domicile_id.nil? # Ignore any unmapped values
        next if user.custom_field_values['domicile'].present? # Ignore if domicile is already set

        custom_field_values_before = user.custom_field_values.dup
        new_values = user.custom_field_values.merge('domicile' => domicile_id)

        puts "before: #{custom_field_values_before}"
        puts "after: #{new_values}"

        if user.update_column(:custom_field_values, new_values)
          reporter.add_change(
            { custom_field_values: custom_field_values_before },
            { custom_field_values: new_values },
            context: { tenant: Tenant.current.host, user: user.id }
          )
        else
          reporter.add_error(
            'Failed to update user',
            context: { tenant: Tenant.current.host, user: user.id }
          )
        end
      end
    end

    reporter.report!('map_customfield_to_domicile.json', verbose: true)
  end
end
