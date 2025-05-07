module ReportBuilder
  class Queries::VisitorLanguages < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      exclude_roles: nil,
      **_other_props
    )
      locales = CL2_SUPPORTED_LOCALES.map(&:to_s)
      
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      # TODO
    end
  end
end
