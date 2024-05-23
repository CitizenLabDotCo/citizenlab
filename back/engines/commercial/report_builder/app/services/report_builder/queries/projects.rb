module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(start_at: nil, end_at: nil, **_other_props)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      # First, get all overlapping phases
      phases = Phase.where.not('end_at <= ? OR start_at >= ?', start_date, end_date)

      # TODO: get project ids associated with these phases and filter projects by that
    end
  end
end
