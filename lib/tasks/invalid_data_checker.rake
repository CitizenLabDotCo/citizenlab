
namespace :checks do
  desc "Check if there are any invalid instances and print a report"
  task :invalid_data => :environment do
    issues = {}

    cl2_root_models.each do |claz|
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

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        cl2_tenant_models.each do |claz|
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
        end
      end
    end

    if issues.present?
      puts JSON.pretty_generate issues
      fail 'Some data is invalid.'
    else
      puts 'Success!'
    end
  end

  task :analyze_invalid_data, [:logs] => [:environment] do |t, args|
    summary = {}
    issues = JSON.parse open(args[:logs]).read
    issues.each do |host, host_issues|
      host_issues.each do |classname, classissues|
        classissues.each do |id, attributeerrors|
          attributeerrors.each do |attribute, errors|
            errors.each do |error|
              msg = error['error']
              error_type = "#{classname}_#{attribute}_#{msg}"
              summary[error_type] ||= {count: 0, hosts: {}}
              summary[error_type][:count] += 1
              summary[error_type][:hosts] ||= {}
              summary[error_type][:hosts][host] ||= []
              summary[error_type][:hosts][host] += [id]
            end
          end
        end
      end
    end
    summary.to_a.sort_by do |error_type, counts|
      counts[:count]
    end.reverse.each do |error_type, counts|
      puts "#{error_type} (#{counts[:count]})"
      counts[:hosts].each do |host, ids|
        puts "  #{host} (#{ids.size}): #{ids.take 5}"
      end
      puts ''
    end
    nil
  end

  def cl2_tenant_models
    ActiveRecord::Base.descendants.select do |claz|
      ![
        'PgSearch::Document', 
        'Apartment::Adapters::AbstractAdapter::SeparateDbConnectionHandler', 
        'ApplicationRecord', 
        'PublicApi::ApiClient', 
        'Tenant'
      ].include? claz.name
    end.select do |claz|
      claz.descendants.empty?
    end
  end

  def cl2_root_models
    [PublicApi::ApiClient, Tenant]
  end

  def validation_errors object
    object.errors.details if !object.valid?
  end

end
