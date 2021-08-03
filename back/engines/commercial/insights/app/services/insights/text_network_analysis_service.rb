# frozen_string_literal: true

module Insights
  class TextNetworkAnalysisService
    # @param [NLP::TextNetworkAnalysisTask] tna_task
    # @param [NLP::TextNetworkAnalysisResult] tna_result
    def handle(tna_task, tna_result)
      Tenant.find(tna_result.tenant_id).switch do
        task_view = Insights::TextNetworkAnalysisTaskView.find_by(task: tna_task).destroy!

        if tna_result.success?
          Insights::TextNetwork
            .find_or_initialize_by(view: task_view.view, language: task_view.language)
            .tap { |tn| tn.network = tna_result.network.as_json }
            .save!
        end
      end
    end

    # @param [Insights::View] view
    # @return [Array<Insights::TextNetworkAnalysisTaskView>]
    def analyse(view)
      task_by_language = NLP::TextNetworkService.new.analyse(view.scope, self.class)

      task_by_language.map do |language, tna_task|
        Insights::TextNetworkAnalysisTaskView.create(view: view, task: tna_task, language: language)
      end
    end
  end
end
