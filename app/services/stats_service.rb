class StatsService

  def group_by_time resource, field, start_at, end_at, interval
    resource.send("group_by_#{interval}",
      field, 
      range: start_at..end_at,
      time_zone: Tenant.settings('core','timezone')
    ).count
  end
end