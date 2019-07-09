
namespace :checks do
  desc "Check if there are any invalid instances and print a report"
  task :invalid_data => :environment do
    issues = {}

    cl2_root_models.each do |claz|
      claz.all.each do |object|
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
          claz.all.each do |object|
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
      pp issues
      fail 'Some data is invalid.'
    end
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
