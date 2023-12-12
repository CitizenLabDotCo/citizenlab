module ReportBuilder
  class Queries::SurveyResults
    def run_query(phase_id: nil, **_other_props)
      phase = Phase.find(phase_id)
      SurveyResultsGeneratorService.new(phase).generate_results
    end
  end
end
