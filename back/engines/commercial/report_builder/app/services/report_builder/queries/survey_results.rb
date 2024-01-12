module ReportBuilder
  class Queries::SurveyResults < ReportBuilder::Queries::Base
    def run_query(phase_id: nil, **_other_props)
      return {} if phase_id.blank?

      phase = Phase.find(phase_id)
      SurveyResultsGeneratorService.new(phase).generate_results
    end
  end
end
