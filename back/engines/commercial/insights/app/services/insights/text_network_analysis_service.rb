# frozen_string_literal: true

module Insights
  # = TextNetworkAnalysisService
  #
  # This service is used for both creating and handling text-network-analysis
  # tasks for views. The task creation is delegated to an instance of
  # +NLP::TextNetworkAnalysisService+. While delegating the task creation, the
  # service registers its class as handler for those tasks. As an handler class,
  # it must implement an +#handle+ method which will be invoked to process the
  # results of the text network analysis.
  class TextNetworkAnalysisService

    # @param [NLP::TextNetworkAnalysisService] nlp_tna_service
    def initialize(nlp_tna_service=nil)
      @nlp_tna_service = nlp_tna_service
    end

    # @param [NLP::TextNetworkAnalysisTask] tna_task
    # @param [NLP::TextNetworkAnalysisResult] tna_result
    def handle(tna_task, tna_result)
      Tenant.find(tna_result.tenant_id).switch do
        task_view = Insights::TextNetworkAnalysisTaskView.find_by(task: tna_task)
        return unless task_view

        task_view.destroy!

        if tna_result.success?
          Insights::TextNetwork
            .find_or_initialize_by(view: task_view.view, language: tna_result.locale)
            .tap { |tn| tn.network = tna_result.network }
            .save!
        end

        nil
      end
    end

    # Trigger the text network analysis for a view. This creates a TNA task for
    # each language represented in the view's inputs.
    #
    # @param [Insights::View] view
    # @return [Array<Insights::TextNetworkAnalysisTaskView>]
    def analyse(view)
      task_by_language = nlp_tna_service.analyse(view.scope, self.class)

      # Remove existing networks for languages that are no longer in use.
      Insights::TextNetwork.where(view: view)
                           .where.not(language: task_by_language.keys)
                           .destroy_all

      task_by_language.map do |language, tna_task|
        Insights::TextNetworkAnalysisTaskView.create(view: view, task: tna_task, language: language)
      end
    end

    def nlp_tna_service
      @nlp_tna_service ||= NLP::TextNetworkAnalysisService.new
    end
  end
end
