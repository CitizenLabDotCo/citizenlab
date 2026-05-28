# frozen_string_literal: true

namespace :id_acm do
  task :configure_rrn_field, %i[tenant_host] => [:environment] do |_t, args|
    Tenant.find_by(host: args[:tenant_host]).switch!

    puts 'Adding hidden field for RRN verification result'

    if CustomField.find_by(key: 'rrn_verfification_result')
      puts 'Hidden custom field for RRN result already exists'
      exit
    end

    puts 'Creating hidden custom field and options'
    field = CustomField.create!(resource_type: 'User', title_multiloc: { 'en' => 'RRN Verification Result', 'nl-BE' => 'RRN Verificatie Resultaat' }, key: 'rrn_verfification_result', input_type: 'select', hidden: true)
    option1 = CustomFieldOption.create!(key: 'valid', title_multiloc: { 'en' => 'Valid', 'nl-BE' => 'Geldig' }, custom_field: field)
    CustomFieldOption.create!(key: 'lives_outside', title_multiloc: { 'en' => 'Lives outside', 'nl-BE' => 'Woont buitenaf' }, custom_field: field)
    CustomFieldOption.create!(key: 'under_minimum_age', title_multiloc: { 'en' => 'Under minimum age', 'nl-BE' => 'Onder minimum leeftijd' }, custom_field: field)
    CustomFieldOption.create!(key: 'no_match', title_multiloc: { 'en' => 'No match', 'nl-BE' => 'Geen overeenkomst' }, custom_field: field)
    CustomFieldOption.create!(key: 'service_error', title_multiloc: { 'en' => 'Service error', 'nl-BE' => 'Dienst fout' }, custom_field: field)

    puts 'Creating smart group for verified users'
    Group.create!(
      slug: 'rrn-is-valid',
      title_multiloc: { 'en' => 'RRN is valid', 'nl-BE' => 'RRN is geldig' },
      membership_type: 'rules',
      rules: [{ value: option1.id, ruleType: 'custom_field_select', predicate: 'has_value', customFieldId: field.id }]
    )

    puts 'Adding field to configuration'
    config = AppConfiguration.instance
    method = config.settings['verification']['verification_methods'].find { |m| m['name'] == 'acm' }
    method['rrn_result_custom_field_key'] = field.key
    config.save!

    puts 'DONE!'
  end
end
