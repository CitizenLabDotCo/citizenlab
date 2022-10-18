# frozen_string_literal: true

require 'yaml'

# NOTE: This task should only be need to fix tenants created during summer 2022 when unused translations were removed
namespace :fixes do
  task :add_missing_locales, %i[host locale] => [:environment] do |_t, args|
    desc 'Add missing locale values from the base template.'

    locale = args[:locale]
    tenant = Tenant.find_by(host: args[:host])
    tenant.switch do
      locale_fixer = MissingLocaleFixer.new
      locale_fixer.fix(locale)
    end
  end
end

class MissingLocaleFixer
  def fix(locale)
    template = YAML.safe_load(open('config/tenant_templates/base.yml').read, [Time], [], true)
    template['models'].each do |model_name, fields|
      fields.each do |attributes|
        attributes.each do |field_name, _field_value|
          next unless /_multiloc$/.match?(field_name)

          model_class = model_name.classify.constantize
          unless [Event, Project].include?(model_class) # Exclude these objects as they are not structural data
            update_multiloc(model_class, locale, attributes, field_name)
          end
        end
      end
    end
  end

  private

  def update_multiloc(class_name, locale, attributes, multiloc_field_name)
    search_field_name = /^CustomField/.match?(class_name) ? 'key' : 'code'
    search_key = attributes[search_field_name]
    new_translation = I18n.with_locale(locale) { I18n.t!(attributes[multiloc_field_name]) }
    records = class_name.constantize.where "#{search_field_name} = ?", search_key
    records.each do |record|
      multiloc_field_value = record[multiloc_field_name]
      if multiloc_field_value[locale]
        Rails.logger.info("!! #{locale} ALREADY EXISTS for  #{class_name}.#{multiloc_field_name}")
      elsif multiloc_field_value[locale] == ''
        Rails.logger.error("Locale Error: #{locale} is set to empty for #{class_name} #{search_field_name}=#{search_key}")
      else
        Rails.logger.info("Updating #{class_name}.#{multiloc_field_name} with '#{new_translation}'")
        record[multiloc_field_name][locale] = new_translation
        record.save!
      end
    end
  end
end
