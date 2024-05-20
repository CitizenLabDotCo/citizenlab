module ReportBuilder
  class Queries::MethodsUsed < ReportBuilder::Queries::Base
    def run_query(start_at: nil, end_at: nil, **_other_props)
      filter_start_date, filter_end_date = TimeBoundariesParser.new(start_at, end_at).parse

      count_per_method = Phase
        .where.not('end_at <= ? OR start_at >= ?', filter_start_date, filter_end_date)
        .group(:participation_method)
        .count

      { count_per_method: count_per_method }
    end
  end
end
