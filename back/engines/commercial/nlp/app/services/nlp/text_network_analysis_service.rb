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

    # Creates and returns (async) TNA tasks for ideas of a project, one task 
    # per language. It returns a hash that maps the language to the 
    # corresponding task.
    # 
    # @param [Project] project
    # @param [Class] handler_class
    # @return [Hash{String => NLP::TextNetworkAnalysisTask}]
    def analyse(project, handler_class)
      language_task_pairs = project_locales(project).map do |locale|
        tenant_id = Tenant.current.id
        nlp_task_id = nlp_client.text_network_analysis(tenant_id, project.id, locale)
        task = TextNetworkAnalysisTask.create(task_id: nlp_task_id, handler_class: handler_class)
        
        [locale, task]
      end

      Hash[language_task_pairs]
    end

    private

    # Returns the languages of the ideas of a given project.
    # 
    # @param [Project] project
    # @return [Array[String]]
    def project_locales(project)
      # [TODO] Find a more efficient way to get unique keys using SQL directly.
      # See: https://marcqualie.com/2015/08/postgresql-distinct-jsonb-keys
      project.ideas.flat_map { |i| i.body_multiloc.keys }.uniq
    end
  end
end
