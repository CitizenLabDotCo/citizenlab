# frozen_string_literal: true

class AdminApi::TenantsFinder
  def tenants_json
    Rails.cache.fetch(cache_key, expires_in: 1.hour) { serialize_tenants.to_json }
  end

  private

  # Helper function to serialize an enumeration of tenants efficiently.
  # It works by batch loading app configurations to avoid n+1 queries.
  # It could be move to a dedicated service if it keeps growing, but
  # keeping things simple for now.
  def serialize_tenants
    configs = AppConfiguration.from_tenants(tenants).sort_by(&:host)
    tenants.sort_by(&:host).zip(configs).map do |tenant, config|
      AdminApi::TenantSerializer.new(tenant, app_configuration: config)
    end
  end

  def tenants
    Tenant.not_deleted
  end

  def app_config_max_updated_at
    configs_sql = AppConfiguration.sql_from_tenants(tenants)
    sql = "SELECT MAX(configs.updated_at) FROM (#{configs_sql}) as configs"
    ActiveRecord::Base.connection.execute(sql).to_a.first['max']
  end

  def cache_key
    size = tenants.size
    # If we didn't need app configuration max updated_at, we could use
    # tenants.cache_key_with_version
    timestamp = [tenants.maximum(:updated_at), app_config_max_updated_at].max
    # https://apidock.com/rails/v6.1.3.1/ActiveRecord/Integration/cache_key_with_version
    # https://apidock.com/rails/v6.1.3.1/ActiveRecord/Relation/compute_cache_version
    "json/#{tenants.cache_key}-#{size}-#{timestamp.utc.to_fs(:usec)}"
  end
end
