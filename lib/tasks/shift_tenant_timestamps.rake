
namespace :cl2back do
  desc "Shift all timestamps (except created_at for activities) of the given list of tenants (;-separated) or all demo tenants if not provided."
  task :shift_tenant_timestamps, [:hours,:hosts] => [:environment] do |t, args|
    data_listing = Cl2DataListingService.new

    tenants = if args[:hosts].present?
      Tenant.where(host: args[:hosts].split(';').map(&:strip))
    else
      Tenant.select do |tenant|
        tenant.settings.dig('core', 'lifecycle_stage') == 'demo'
      end
    end
    tenants.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        data_listing.cl2_tenant_models.each do |claz|
          claz.all.find_each do |object|
            timestamp_attrs = data_listing.timestamp_attributes claz
            timestamp_attrs.delete('created_at') if claz.name == Activity.name
            changes = {}
            timestamp_attrs.each do |ts| 
              value = object.send ts
              if value
                changes[ts] = value + args[:hours].to_i.hours
              end
            end
            object.update_columns changes
          end
        end
        LogActivityJob.perform_later(tenant, 'timestamps_shifted', nil, Time.now.to_i, payload: {hours_shifted: args[:hours]})
      end
    end
  end