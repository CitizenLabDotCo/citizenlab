# frozen_string_literal: true

module NLP
  class TextNetworkAnalysisService
    attr_reader :nlp_client

    class << self
      # Handle the result of a text-network-analysis task. The method can be
      # safely (and is meant to be) called outside the context of the tenant.
      # It will switch to the tenant pertaining to the task.
      def handle_result(tna_result)
        Tenant.find(tna_result.tenant_id).switch do
          tna_task = TextNetworkAnalysisTask.find_by(task_id: tna_result.task_id)
          return unless tna_task

          tna_task.handler_class.constantize.new.handle(tna_task, tna_result)

          # Task deletion must come after it is 'handled' otherwise it might
          # violate foreign key constraints as other models might still
          # reference the task. That's the handler responsibility to clean
          # those references after processing the task result.
          tna_task.destroy!
        end
      end
    end

    # @param [NLP::Api] nlp_client
    def initialize(nlp_client = nil)
      @nlp_client = nlp_client || NLP::Api.new
    end

    # Creates and returns (asynchronous) TNA tasks for a list of inputs, one task per
    # language. It returns a hash mapping the language to the task id.
    #
    # @param inputs [Enumerable<Idea>] the list of inputs to analyse
    # @param handler_class [Class] the task results will handled by instances of this class
    # @return [Hash{String => NLP::TextNetworkAnalysisTask}]
    def analyse(inputs, handler_class)
      return {} if inputs.empty?

      tenant_id = Tenant.current.id
      input_identifiers = inputs.pluck(:id)
      tasks_by_language = nlp_client.text_network_analysis_by_ids(tenant_id, input_identifiers)

      tasks_by_language.map do |language, task_id|
        task = TextNetworkAnalysisTask.create!(task_id: task_id, handler_class: handler_class)
        [language, task]
      end.to_h
    end
  end
end
