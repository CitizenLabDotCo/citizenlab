# frozen_string_literal: true

module FlagInappropriateContent
  class ToxicityDetectionService
    MAP_TOXICITY_LABEL = {
      'A' => 'insult',
      'B' => 'harmful',
      'C' => 'sexually_explicit',
      'D' => 'spam',
      'E' => nil
    }

    def initialize
      region = ENV.fetch('AWS_TOXICITY_DETECTION_REGION', nil) # Some clusters (e.g. Canada) are not allowed to send data to the US or Europe.
      @llm = Analysis::LLM::ClaudeInstant1.new(region: region) if region
    end

    def flag_toxicity!(flaggable, attributes: [])
      return unless AppConfiguration.instance.feature_activated? 'flag_inappropriate_content'

      flag_service = InappropriateContentFlagService.new

      texts = extract_texts flaggable, attributes
      if texts.blank?
        if (flag = flaggable.inappropriate_content_flag)
          flag.update! toxicity_label: nil
          flag_service.maybe_delete! flag
        end
        return
      end
      toxicity_labels = texts.filter_map { |text| classify_toxicity(text) }
      if toxicity_labels.present?
        flag_service.introduce_flag! flaggable, toxicity_label: toxicity_labels.first
      elsif (flag = flaggable.inappropriate_content_flag)
        flag.update! toxicity_label: nil
        flag_service.maybe_delete! flag
      end
    end

    private

    def extract_texts(flaggable, attributes)
      texts = []
      attributes.each do |atr|
        next if flaggable[atr].blank?

        texts += if atr.to_s.ends_with? '_multiloc'
          flaggable[atr].values
        else
          [flaggable[atr]]
        end
      end
      texts.compact! # until nil values in multilocs is fixed
      texts
    end

    def classify_toxicity(text)
      return if !@llm # Some clusters (e.g. Canada) are not allowed to send data to the US or Europe.

      prompt = Analysis::LLM::Prompt.new.fetch('claude_toxicity_detection', text: text)
      response = @llm.chat(prompt, assistant_prefix: 'My answer is (')
      MAP_TOXICITY_LABEL.find do |class_id, _|
        response.strip.starts_with? "#{class_id})"
      end&.last
    end
  end
end

# If the user's request is insulting or a threat, reply with (insult).
#         If the user's request refers to harmful or illegal activities, reply with (harmful).
#         If the user's request involves pornographic or sexual activities, reply with (sexually_explicit).
#         If the user's request is spam, reply with (spam).
#         If the user's request is not spam or does not refer to harmful, pornographic, or illegal activities, reply with (ok).
