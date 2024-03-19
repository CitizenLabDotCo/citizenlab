# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Base
    POOL_SIZE = 3
    OTHER_TERMS = %w[
      other
      otro
      autre
      andere
      altro
      outro
      ander
      другой
      其他
      他の
      다른
      آخر
      diğer
      अन्य
      інший
      inny
      alt
      άλλος
      másik
      jiný
      อื่น
      annan
      anden
      annen
      toinen
      אחר
      lain
      khác
      lain
      iba
      altul
    ]

    attr_reader :analysis, :task, :input_to_text

    class AutoTaggingFailedError < StandardError; end

    def self.for_auto_tagging_method auto_tagging_method, *params
      case auto_tagging_method
      when 'controversial'
        AutoTaggingMethod::Controversial.new(*params)
      when 'platform_topic'
        AutoTaggingMethod::PlatformTopic.new(*params)
      when 'sentiment'
        AutoTaggingMethod::Sentiment.new(*params)
      when 'language'
        AutoTaggingMethod::Language.new(*params)
      when 'nlp_topic'
        AutoTaggingMethod::NLPTopic.new(*params)
      when 'label_classification'
        AutoTaggingMethod::LabelClassification.new(*params)
      when 'few_shot_classification'
        AutoTaggingMethod::FewShotClassification.new(*params)
      else
        raise ArgumentError, "Unsupported auto_tagging_method #{auto_tagging_method}"
      end
    end

    def initialize(auto_tagging_task)
      @analysis = auto_tagging_task.analysis
      @task = auto_tagging_task
      @input_to_text = InputToText.new(@analysis.associated_custom_fields)
    end

    def execute
      task.set_in_progress!
      begin
        run
        task.set_succeeded!
      rescue AutoTaggingFailedError => e
        ErrorReporter.report(e)
        task.set_failed!
      end
    end

    def classify(input, topics)
      inputs_text = input_to_text.format_all([input])
      prompt = LLM::Prompt.new.fetch('fully_automated_classifier', inputs_text: inputs_text, topics: topics)
      chosen_topic =  begin
        gpt3.chat(prompt)
      rescue Faraday::BadRequestError => e # TODO: Turn off filtering https://go.microsoft.com/fwlink/?linkid=2198766
        ErrorReporter.report(e)
        return 'Other'
      end
      puts chosen_topic ###
      if topics.include? chosen_topic
        chosen_topic
      else
        # TODO: Log something if chosen_topic != 'Other'?
        'Other'
      end
    end

    protected

    def gpt4
      @gpt4 ||= LLM::GPT4Turbo.new
    end

    def gpt3
      @gpt3 ||= LLM::GPT35Turbo.new
    end

    def other_term?(tag_name)
      OTHER_TERMS.include?(tag_name.downcase)
    end

    def classify_many!(inputs, topics, tag_type)
      pool = Concurrent::FixedThreadPool.new(POOL_SIZE)
      results = Concurrent::Hash.new
      failure = Concurrent::AtomicBoolean.new(false)

      inputs.each do |input|
        sleep 0.1 # Avoid 429 Too Many Requests
        pool.post do
          Rails.application.executor.wrap do
            begin
              results[input.id] = classify(input, topics) if failure.false?
            rescue StandardError => e
              failure.make_true
              ErrorReporter.report(e)
              raise # TODO: Abort the whole process
            end
          end
        end
      end
      processed_inputs = []
      do_while_pool_is_running(pool) do
        raise 'Something went wrong with a thread during classification!' if failure.true?

        (results.keys - processed_inputs).each do |input_id|
          topic = results[input_id]
          assign_topic!(input_id, topic, tag_type)
          processed_inputs << input_id
          yield(input_id)
        end
      end
    end

    def filtered_inputs
      @filtered_inputs ||= InputsFinder.new(analysis, task.filters.symbolize_keys).execute
    end

    def find_or_create_tagging!(input_id:, tag_id:)
      Tagging.find_by(input_id: input_id, tag_id: tag_id) ||
        Tagging.create!(input_id: input_id, tag_id: tag_id, background_task: task)
    end

    def assign_topic!(input_id, topic, tag_type)
      return if other_term?(topic)

      tag = Tag.find_or_create_by!(name: topic, tag_type: tag_type, analysis: analysis)
      find_or_create_tagging!(input_id: input_id, tag_id: tag.id)
    end

    def update_progress(progress)
      task.update!(progress: progress)
    end

    def deduct_locale(input)
      input.author&.locale ||
        input.title_multiloc&.keys&.first ||
        input.body_multiloc&.keys&.first ||
        AppConfiguration.instance.settings('core', 'locales').first
    end

    def do_while_pool_is_running(pool, wait_interval: 0.1)
      while pool.running?
        pool.wait_for_termination(wait_interval)
        yield
        pool.shutdown if pool.running? && pool.queue_length.zero?
      end
      pool.wait_for_termination
      yield
    end
  end
end
