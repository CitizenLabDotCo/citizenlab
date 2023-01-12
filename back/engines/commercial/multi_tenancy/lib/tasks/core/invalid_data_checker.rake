# frozen_string_literal: true

namespace :checks do
  desc 'Check if there are any invalid instances and print a report'
  task invalid_data: :environment do
    issues = {}
    summary = { durations: {}, issues: {} }

    Cl2DataListingService.new.cl2_global_models.each do |claz|
      claz.all.find_each do |object|
        errors = validation_errors object
        if errors
          issues[nil] ||= {}
          tenant_issues = issues[nil]
          tenant_issues[claz.name] ||= {}
          claz_issues = tenant_issues[claz.name]
          claz_issues[object.id] = errors
        end
      end
    end

    active_tenants = Tenant.select do |tenant|
      tenant.configuration.active? || tenant.host.ends_with?(ENV.fetch('TEMPLATE_URL_SUFFIX', '.localhost'))
    end
    active_tenants.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Processing #{tenant.host}..."
        schema_leaf_models = Cl2DataListingService.new.cl2_schema_leaf_models.reject do |claz|
          skip_class_for_inconsistent_data_checking? claz
        end
        schema_leaf_models.each do |claz|
          t1 = Time.zone.now
          claz.all.find_each do |object|
            errors = validation_errors object
            if errors
              issues[tenant.host] ||= {}
              tenant_issues = issues[tenant.host]
              tenant_issues[claz.name] ||= {}
              claz_issues = tenant_issues[claz.name]
              claz_issues[object.id] = errors
            end
          end
          t2 = Time.zone.now
          summary[:durations][claz.name] ||= 0
          summary[:durations][claz.name] += (t2 - t1)
        end
      end
    end

    issues.each do |host, host_issues|
      host_issues.each do |classname, classissues|
        classissues.each do |id, attributeerrors|
          attributeerrors.each do |attribute, errors|
            errors.each do |error|
              msg = error[:error]
              error_type = "#{classname}_#{attribute}_#{msg}"
              summary[:issues][error_type] ||= { count: 0, hosts: {} }
              summary[:issues][error_type][:count] += 1
              summary[:issues][error_type][:hosts] ||= {}
              summary[:issues][error_type][:hosts][host] ||= []
              summary[:issues][error_type][:hosts][host] += [id]
            end
          end
        end
      end
    end

    if issues.present?
      puts JSON.pretty_generate summary
      raise 'Some data is invalid.'
    else
      puts 'Success!'
    end
  end

  def validation_errors(object)
    return object.errors.details unless object.valid?

    if object.instance_of?(User) && !object.custom_field_values.values.select do |v|
         v.instance_of?(Array) ? v.include?(nil) : v.nil?
       end.empty?
      { custom_field_values: [{ error: 'Contains null values', value: object.custom_field_values }] }
    end
  end

  def skip_class_for_inconsistent_data_checking?(claz)
    # Skip checking for less crucial classes that require
    # a lot of processing.
    return true if claz.name == 'EmailCampaigns::Delivery'
    return true if claz.name.starts_with? 'Notifications::'
    return true if claz.name == 'CommonPassword'

    false
  end
end
