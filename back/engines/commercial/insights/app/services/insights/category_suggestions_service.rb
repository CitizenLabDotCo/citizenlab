# frozen_string_literal: true

module Insights
  class CategorySuggestionsService
    
    class << self

      # @param [NLP::ZeroshotClassificationMessage] zsc_message
      def save_suggestion(zsc_message)
        return unless zsc_message.success?

        Tenant.find(zsc_message.tenant_id).switch do
          zsc_task = ZeroshotClassificationTask.find_by(id: zsc_message.task_id)
          return unless zsc_task

          save_predictions(zsc_message.predictions)
          zsc_task.destroy!
        end
      end

      private

      # @param[Array<NLP::ZeroshotClassificationMessage::Prediction>] predictions
      def save_predictions(predictions)
        assignment_service = CategoryAssignmentsService.new

        predictions.group_by(&:document_id).each do |document_id, predictions|
          input = ::Idea.find(document_id)
          categories = Category.where(id: predictions.map(&:label_id))
          assignment_service.add_suggestions(input, categories)
        rescue ActiveRecord::RecordNotFound
          # Ignore: don't save anything if the input cannot be found.
        end
      end
    end

    attr_reader :nlp_client

    def initialize(nlp_client = nil)
      @nlp_client = nlp_client || NLP::API.new
    end

    def classify(inputs, categories)
      documents = documents(inputs)
      return [] unless documents.any?

      nlp_client.zeroshot_classification(
        candidate_labels: candidate_labels(categories),
        documents: documents,
        tenant_id: AppConfiguration.instance.id,
        locale: nil # TODO: the nlp service requires it but do not use it.
      )
    end

    private

    # @return [Array<Hash>]
    def documents(inputs)
      inputs.map { |i| { text: input_to_text(i), doc_id: i.id } }
            .select { |document| document['text'] }
    end
    
    # @param [Idea] input
    # @return [String,NilClass]
    def input_to_text(input)
      # [TODO] We currently assume that the multiloc contains only one body.
      # It seems to be true in most cases. (The UI does not allow a user to provide translations.)
      # Might not be true in seed data or similar settings.
      text = input.body_multiloc.compact.values.first
      ActionView::Base.full_sanitizer.sanitize(text).presence
    end

    # @param [Enumerable<Insights::Category>] categories
    # @return [Array]
    def candidate_labels(categories)
      categories.map { |c| { text: c.name, label_id: c.id } }
    end
  end
end

