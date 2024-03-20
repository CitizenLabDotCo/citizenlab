module ReportBuilder
  class Queries::SurveyResults < ReportBuilder::Queries::Base
    def run_query(phase_id: nil, **_other_props)
      phase = Phase.find_by(id: phase_id)
      return {} if phase.blank?

      SurveyResultsGeneratorService.new(phase).generate_results
    end
  end
end
