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
    FLAGGABLE_TO_DEFAULT_ATTRIBUTES = {
      'Idea' => %i[title_multiloc body_multiloc location_description],
      'Comment' => %i[body_multiloc]
    }

    def initialize
      region = ENV.fetch('AWS_TOXICITY_DETECTION_REGION', nil) # Some clusters (e.g. Canada) are not allowed to send data to the US or Europe.
      @llm = Analysis::LLM::Claude3Haiku.new(region: region) if region
    end

    # @return [InappropriateContentFlag, nil] The flag if one was created, nil otherwise
    def flag_toxicity!(flaggable, attributes: nil)
      return unless AppConfiguration.instance.feature_activated? 'flag_inappropriate_content'

      attributes ||= default_attributes(flaggable)
      flag_service = InappropriateContentFlagService.new

      classification = check_toxicity(flaggable, attributes:)
      if classification
        flag_service.introduce_flag! flaggable, classification
      elsif (flag = flaggable.inappropriate_content_flag)
        flag.update! toxicity_label: nil
        flag_service.maybe_delete! flag
        nil
      end
    end

    def check_toxicity(flaggable, attributes: nil)
      attributes ||= default_attributes(flaggable)
      texts = extract_texts flaggable, attributes
      return if texts.blank?

      texts.filter_map { |text| classify_toxicity(text) }.first
    end

    private

    def default_attributes(flaggable)
      FLAGGABLE_TO_DEFAULT_ATTRIBUTES[flaggable.class.name]
    end

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
      response = @llm.chat(prompt, assistant_prefix: 'My answer is (').strip
      toxicity_label = MAP_TOXICITY_LABEL.find do |class_id, _|
        response.starts_with? "#{class_id})"
      end&.last
      if toxicity_label
        ai_reason = response[2, response.length].strip
        { toxicity_label: toxicity_label, ai_reason: ai_reason }
      end
    end
  end
end
