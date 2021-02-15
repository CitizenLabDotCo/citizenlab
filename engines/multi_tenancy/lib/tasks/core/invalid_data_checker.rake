
namespace :checks do
  desc "Check if there are any invalid instances and print a report"
  task :invalid_data => :environment do
    issues = {}
    summary = { durations: {}, issues: {} }

    Cl2DataListingService.new.cl2_root_models.each do |claz|
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

    Tenant.select do |tenant|
      tenant.settings.dig('core', 'lifecycle_stage') == 'active' || tenant.host.ends_with?(ENV.fetch('TEMPLATE_URL_SUFFIX','.localhost'))
    end.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Processing #{tenant.host}..."
        Cl2DataListingService.new.cl2_tenant_models.select do |claz|
          !skip_class_for_inconsistent_data_checking? claz
        end.each do |claz|
          t1 = Time.now
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
          t2 = Time.now
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
              summary[:issues][error_type] ||= {count: 0, hosts: {}}
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
      fail 'Some data is invalid.'
    else
      puts 'Success!'
    end
  end

  def validation_errors object
    return object.errors.details if !object.valid?
    if object.class.name == 'User' && !object.custom_field_values.values.select{|v| v.class == Array ? v.include?(nil) : v.nil?}.empty?
      return {custom_field_values: "Contains null values"}
    end
  end

  def skip_class_for_inconsistent_data_checking? claz
    # Skip checking for less crucial classes that require
    # a lot of processing.
    return true if claz.name == 'EmailCampaigns::Delivery'
    return true if claz.name.starts_with? 'Notifications::'
    false
  end

end
