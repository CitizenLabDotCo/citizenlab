# frozen_string_literal: true

require 'parallel'

module IdeaFeed
  # Service used by IdeaFeed (presentation_mode='feed') to classify ideas into topics.
  class TopicClassificationService
    class InvalidLLMResponse < StandardError; end
    RETRIES_INVALID_RESPONSE = 3

    def initialize(phase)
      @phase = phase
    end

    # Given an idea, classifies it into one or more topics, overwriting any
    # previous classifications.
    def classify_topics!(idea)
      topics = load_topics.to_a
      llm = create_llm
      prompt = classification_prompt(idea, topics)
      selected_topics = call_llm_with_retries(llm, prompt, topics)
      idea.update!(input_topics: selected_topics)
      selected_topics
    end

    # Classifies multiple ideas in parallel. LLM requests are parallelized,
    # but database operations are kept sequential.
    # Returns a hash of { idea => selected_topics }.
    def classify_parallel_batch(ideas, n_threads: 24)
      ideas_array = ideas.to_a
      return {} if ideas_array.empty?

      # All database access happens here (before parallelization)
      topics = load_topics.to_a
      llm = create_llm

      # Pre-generate all prompts (uses custom_form, custom_fields, AppConfiguration)
      prompts_by_idea = ideas_array.index_with { |idea| classification_prompt(idea, topics) }

      # Parallel section: pure network I/O only
      results = Parallel.map(ideas_array, in_threads: n_threads) do |idea|
        prompt = prompts_by_idea[idea]
        selected_topics = call_llm_with_retries(llm, prompt, topics)
        [idea, selected_topics]
      end

      # Database writes (sequential, after all LLM calls complete)
      results.each do |idea, selected_topics|
        idea.update!(input_topics: selected_topics)
      end

      results.to_h
    end

    BATCH_SIZE = 24

    def classify_all_inputs_in_background!
      idea_ids = @phase.ideas.published.pluck(:id)
      classification_jobs = idea_ids.each_slice(BATCH_SIZE).map do |batch_ids|
        BatchTopicClassificationJob.new(@phase, batch_ids)
      end
      ActiveJob.perform_all_later(classification_jobs)
    end

    private

    def load_topics
      @phase.project.input_topics.where(depth: 0).order(:lft).includes(:children)
    end

    def create_llm
      LLMSelector.new.llm_class_for_use_case('idea_feed_live_classification').new
    end

    def parse_llm_response(response, topics)
      raise InvalidLLMResponse unless response.is_a?(Array) && response.all? { |it| it.is_a?(String) && it.match?(/\A\d+(\.\d+)?\z/) }

      response.map do |id|
        if id.include?('.')
          parent_index, child_index = id.split('.').map(&:to_i)
          topics[parent_index - 1].children[child_index - 1]
        else
          topics[id.to_i - 1]
        end
      end
    end

    def call_llm_with_retries(llm, prompt, topics)
      RETRIES_INVALID_RESPONSE.times do |i|
        response = llm.chat(prompt, response_schema: classification_response_schema)
        selected_topics = parse_llm_response(response, topics)
        return selected_topics if selected_topics.all?(InputTopic)

        Rails.logger.warn("LLM response for idea classification contained invalid topic IDs. Attempt #{i + 1}. Retrying...")
      rescue InvalidLLMResponse
        Rails.logger.warn("LLM response `#{response}` for idea classification was not valid. Attempt #{i + 1}/#{RETRIES_INVALID_RESPONSE}. Retrying...")
      end
      []
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end

    def classification_prompt(idea, topics)
      form = @phase.pmethod.custom_form
      input_text = Analysis::InputToText.new(custom_fields_without_topics(form)).formatted(idea)
      ::Analysis::LLM::Prompt.new.fetch('idea_feed_live_classification',
        multiloc_service:,
        project: idea.project,
        topics:,
        input_text:)
    end

    def custom_fields_without_topics(form)
      form.custom_fields.reject { |f| f.key == 'topic_ids' }
    end

    def classification_response_schema
      {
        type: 'array',
        items: { type: 'string', description: 'The ID of a (sub)topic (e.g., "1" for a topic or "1.2" for a subtopic)' }
      }
    end
  end
end
