# frozen_string_literal: true

class StatsService
  def group_by_time(resource, field, start_at, end_at, interval)
    resource.send(
      :"group_by_#{interval}",
      field,
      range: start_at..end_at,
      time_zone: AppConfiguration.instance.settings('core', 'timezone')
    ).count
  end

  def group_by_time_cumulative(resource, field, start_at, end_at, interval)
    serie = group_by_time(resource, field, start_at, end_at, interval)
    count_at_start_at = resource.where("#{field} < ?", start_at).count
    # When the given resource scope is a GROUP BY query
    if count_at_start_at.is_a? Hash
      serie.each_with_object(count_at_start_at) do |(group, count), totals|
        totals[group.first] = 0 unless totals[group.first]
        totals[group.first] += count
        serie[group] = totals[group.first]
      end
    else # When the given reource scope is a normal query
      serie.inject(count_at_start_at) do |total, (date, count)|
        serie[date] = count + total
      end
    end
    serie
  end
end
