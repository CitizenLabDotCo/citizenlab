# frozen_string_literal: true

module Insights
  # This service provides utils to interact with the nlp service for category 
  # suggestions.
  #
  # It can be used to trigger requests to the nlp service for category
  # classification and to store prediction results.
  class CategorySuggestionsService
    class << self
      # @param [NLP::ZeroshotClassificationResult] zsc_result zeroshot-classification result
      # @return [Array<Insights::CategoryAssignment>]
      def save_suggestion(zsc_result)
        Tenant.find(zsc_result.tenant_id).switch do
          zsc_task = ZeroshotClassificationTask.find_by(task_id: zsc_result.task_id)
          return [] unless zsc_task

          zsc_task.destroy!
          save_predictions(zsc_result.predictions) if zsc_result.success?
        end
      end

      private

      # @param[Array<NLP::ZeroshotClassificationResult::Prediction>] predictions
      # @return [Array<Insights::CategoryAssignment>]
      def save_predictions(predictions)
        assignment_service = CategoryAssignmentsService.new

        new_assignments = predictions.group_by(&:document_id).flat_map do |document_id, predictions|
          input = ::Idea.find(document_id)
          categories = Category.where(id: predictions.map(&:label_id))
          assignment_service.add_suggestions(input, categories)
        rescue ActiveRecord::RecordNotFound
          # Ignore: don't save anything if the input cannot be found.
        end

        new_assignments.compact # removes nil introduced by missing inputs
      end
    end

    attr_reader :nlp_client

    def initialize(nlp_client = nil)
      @nlp_client = nlp_client || NLP::Api.new
    end

    # Sends requests to the NLP service to creates asynchronous category-suggestion tasks
    # (= zeroshot-classification tasks).
    #
    # @return[Array<Insights::ZeroshotClassificationTask>] Array of pending/ongoing tasks
    def classify(inputs, categories)
      return [] unless inputs.any?

      documents = inputs.map { |i| input_to_document(i) }
      response = nlp_client.zeroshot_classification(
        candidate_labels: candidate_labels(categories),
        documents: documents,
        tenant_id: AppConfiguration.instance.id
      )

      tasks_infos = response['batches'] # It should look like [{'task_id':..., 'doc_ids':..., 'tags_ids':...}, ...]
      create_tasks(tasks_infos)
    end

    # @param [Enumerable<Insights::ZeroshotClassificationTask>] tasks
    # @return [Array<Insights::ZeroshotClassificationTask>] Deleted frozen tasks
    def cancel(tasks)
      ErrorReporter.handle do
        # We need to use identifiers assigned by the NLP service, not the identifier of the record.
        response = nlp_client.cancel_tasks(tasks.pluck(:task_id))
        response.error! unless response.success?
      rescue StandardError
        raise "Failed to cancel category-suggestion tasks: #{tasks.pluck(:task_id)}."
      end
      # Use an `each` block to support both, array and relation of tasks.
      tasks.each(&:destroy)
    end

    # @param [Idea] input
    # @return [Hash{Symbol => String}]
    def input_to_document(input)
      { text: input_to_text(input), doc_id: input.id }
    end

    # @param [Idea] input
    # @return [String]
    def input_to_text(input)
      # We currently assume that the multiloc contains only one locale.
      # It seems to be true in most cases. (The UI does not allow a user to provide translations.)
      title = html_to_text(input.title_multiloc.compact.values.first).strip
      body = html_to_text(input.body_multiloc.compact.values.first).strip
      title = title.ends_with?('.') ? title : "#{title}." # Ensure the title ends with a dot.

      "#{title} #{body}"
    end

    # Remove all tags and HTML entities.
    #
    # @param [String] html
    # @return [String]
    def html_to_text(html)
      ActionView::Base.full_sanitizer.sanitize(html)
    end

    # @param [Enumerable<Insights::Category>] categories
    # @return [Array]
    def candidate_labels(categories)
      categories.map { |c| { text: c.name, label_id: c.id } }
    end

    # @param [Array<Hash>] tasks_infos looks like [{'task_id':..., 'doc_ids':..., 'tags_ids':...}, ...]
    # @return [Array<Insights::ZeroshotClassificationTask>]
    def create_tasks(tasks_infos)
      tasks_infos.map do |task_infos|
        # [TODO] optimize the nb of DB queries
        ZeroshotClassificationTask.create_task(
          task_infos['task_id'],
          Idea.where(id: task_infos['doc_ids']),
          Category.where(id: task_infos['tags_ids'])
        )
      end
    end
  end
end

