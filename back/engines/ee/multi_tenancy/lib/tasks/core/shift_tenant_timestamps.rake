namespace :cl2back do
  desc 'Shift all timestamps (except created_at for activities) by the given number of days of the given list of tenants (;-separated) or all demo tenants if not provided.'
  task :shift_tenant_timestamps, %i[days hosts] => [:environment] do |_, args|
    shifter = MultiTenancy::TenantService.new

    num_days = args[:days]&.to_i || 1
    tenants = if args[:hosts].present?
      Tenant.where host: args[:hosts].split(';').map(&:strip)
    else
      Tenant.not_deleted.with_lifecycle 'demo'
    end

    tenants.order(created_at: :desc).each do |tenant|
      raise 'Attempted to shift timestamps of active tenant!' if tenant.active?
      raise 'Attempted to shift timestamps of churned tenant!' if tenant.churned?

      Apartment::Tenant.switch(tenant.schema_name) do
        shifter.shift_timestamps num_days
      end
    end
  end

  desc 'Executes timestamp shifting for the appropriate amount of time when shifting failed for some tenants'
  task :fix_tenant_timestamp_shifting, %i[since_num_days_ago hosts] => [:environment] do |_, args|
    shifter = MultiTenancy::TenantService.new

    tenants = if args[:hosts].present?
      Tenant.where host: args[:hosts].split(';').map(&:strip)
    else
      Tenant.not_deleted.with_lifecycle 'demo'
    end

    tenants.order(created_at: :desc).each do |tenant|
      raise 'Attempted to shift timestamps of active tenant!' if tenant.active?
      raise 'Attempted to shift timestamps of churned tenant!' if tenant.churned?

      since_num_days_ago = args[:since_num_days_ago].to_i
      tenant_created_at = Activity.where(item: tenant, action: 'created').first&.created_at
      if tenant_created_at && (tenant_created_at < Time.now) && (tenant_created_at > Time.now - since_num_days_ago.days)
        since_num_days_ago = (Time.now.to_date - tenant_created_at.to_date).to_i
      end
      Apartment::Tenant.switch(tenant.schema_name) do
        since = Time.now - since_num_days_ago.days
        days_shifted = Activity.where(item: tenant, action: 'timestamps_shifted').where('created_at > ?', since).count
        days_skipped = since_num_days_ago - days_shifted
        shifter.shift_timestamps days_skipped if days_skipped > 0 && days_shifted != 0
      end
    end
  end
end
