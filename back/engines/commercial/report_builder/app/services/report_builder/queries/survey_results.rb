module ReportBuilder
  class Queries::SurveyResults
    def run_query(project_id:, **_other_props)
      project = Project.find(project_id)
      SurveyResultsGeneratorService.new(project).generate_results
    end
  end
end
