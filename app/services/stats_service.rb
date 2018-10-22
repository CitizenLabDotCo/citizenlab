class StatsService

  def group_by_time resource, field, start_at, end_at, interval
    resource.send("group_by_#{interval}",
      field, 
      range: start_at..end_at,
      time_zone: Tenant.settings('core','timezone')
    ).count
  end

  def group_by_time_cumulative resource, field, start_at, end_at, interval
    serie = group_by_time(resource, field, start_at, end_at, interval)
    count_at_start_at = resource.where("#{field} < ?", start_at).count
    serie.inject(count_at_start_at) do |total, (date, count)|
      new_total = count + total
      serie[date] = new_total
      new_total
    end
    serie
  end
end