# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Base
    POOL_SIZE = 5
    TASK_INTERVAL = 0.3
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

    attr_reader :analysis, :task, :input_to_text, :input_to_text_classify

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
      @input_to_text = InputToText.new(analysis.associated_custom_fields)
      @input_to_text_classify = InputToText.new(classification_fields)
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

    def classify_input_text(input_text, topics)
      prompt = LLM::Prompt.new.fetch('fully_automated_classifier', inputs_text: input_text, topics: topics)
      chosen_topic = begin
        gpt4mini.chat(prompt)
      rescue Faraday::BadRequestError => e # https://go.microsoft.com/fwlink/?linkid=2198766
        ErrorReporter.report(e)
        'Other'
      end
      topics.include?(chosen_topic) ? chosen_topic : 'Other'
    end

    protected

    def gpt4
      @gpt4 ||= LLM::GPT41.new
    end

    def gpt4mini
      @gpt4mini ||= LLM::GPT4oMini.new
    end

    def other_term?(tag_name)
      OTHER_TERMS.include?(tag_name.downcase)
    end

    def classify_many!(inputs, topics, tag_type)
      pool = Concurrent::FixedThreadPool.new(POOL_SIZE)
      tasks = inputs.map.with_index do |input, idx|
        input_id = input.id
        inputs_text = input_to_text_classify.format_all([input])
        wait = idx * TASK_INTERVAL # Avoid 429 Too Many Requests
        Concurrent::ScheduledTask.execute(wait, executor: pool) do
          [input_id, classify_input_text(inputs_text, topics)]
        end
      end
      tasks.each do |task|
        input_id, topic = task.value # Blocks until task either succeeds or fails
        if task.rejected? # Abort the whole process when one task fails
          pool.kill
          raise task.reason
        end
        assign_topic!(input_id, topic, tag_type)
        yield(input_id)
      end
    end

    def filtered_inputs
      @filtered_inputs ||= InputsFinder.new(analysis, task.filters.symbolize_keys).execute.includes(:topics)
    end

    def find_or_create_tagging!(input_id:, tag_id:)
      tagging = Tagging.find_by(input_id: input_id, tag_id: tag_id)
      if !tagging
        tagging = Tagging.create(input_id: input_id, tag_id: tag_id, background_task: task)
        tagging_service.after_create(tagging, nil)
      end
    end

    def assign_topic!(input_id, topic, tag_type)
      return if other_term?(topic)

      tag = Tag.find_by(name: topic, tag_type: tag_type, analysis: analysis)
      if !tag
        tag = Tag.create(name: topic, tag_type: tag_type, analysis: analysis)
        tag_service.after_create(tag, nil)
      end
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

    def classification_fields
      fields = analysis.associated_custom_fields
      if fields.map(&:code).include?('topic_ids') || analysis.participation_method != 'ideation' # TODO: move-participation-method-logic
        fields
      else
        # Include topics in the prompt when classifying (in ideation) to improve the quality of the results
        custom_form = analysis.project.custom_form || CustomForm.new(participation_context: analysis.project)
        project_fields = IdeaCustomFieldsService.new(custom_form).submittable_fields
        fields + [project_fields.find { |field| field.code == 'topic_ids' }].compact
      end
    end

    def tag_service
      @tag_service ||= SideFxTagService.new
    end

    def tagging_service
      @tagging_service ||= SideFxTaggingService.new
    end
  end
end
