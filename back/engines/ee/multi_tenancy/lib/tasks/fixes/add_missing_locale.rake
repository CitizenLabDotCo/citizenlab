# frozen_string_literal: true

require 'yaml'

namespace :fixes do
  task :add_missing_locales, %i[host locale] => [:environment] do |_t, args|
    desc 'Add missing locale values from the base template.'

    locale = args[:locale]
    tenant = Tenant.find_by(host: args[:host])

    tenant.switch do
      template = YAML.safe_load(open('config/tenant_templates/base.yml').read, [Time], [], true)
      template['models'].each do |model_name, fields|
        fields.each do |attributes|
          attributes.each do |field_name, _field_value|
            next unless /_multiloc$/.match?(field_name)

            class_name = model_name.classify
            unless /^(Event|Project)$/.match?(class_name) # Exclude these objects as they are not structural data
              update_multiloc(class_name, locale, attributes, field_name)
            end
          end
        end
      end
    end
  end
end

def update_multiloc(class_name, locale, attributes, multiloc_field_name)
  search_field_name = /^CustomField/.match?(class_name) ? 'key' : 'code'
  search_key = attributes[search_field_name]
  new_translation = I18n.with_locale(locale) { I18n.t!(attributes[multiloc_field_name]) }
  records = class_name.constantize.where "#{search_field_name} = ?", search_key
  records.each do |record|
    multiloc_field_value = record[multiloc_field_name]
    if multiloc_field_value[locale]
      Rails.logger.info("!! #{locale} ALREADY EXISTS for  #{class_name}.#{multiloc_field_name}")
    else
      Rails.logger.info("Updating #{class_name}.#{multiloc_field_name} with '#{new_translation}'")
      multiloc_field_value[locale] = new_translation
      record[multiloc_field_name] = multiloc_field_value
      record.save!
    end
  end
end
