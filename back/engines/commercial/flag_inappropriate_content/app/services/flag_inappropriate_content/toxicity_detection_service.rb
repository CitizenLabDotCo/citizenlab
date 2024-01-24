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
      @llm = Analysis::LLM::ClaudeInstant1.new(region: 'us-east-1') # TODO: Get region from env
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
      toxicity_labels = texts.map(&method(:classify_toxicity)).compact
      if toxicity_labels.present?
        flag_service.introduce_flag! flaggable, toxicity_label: toxicity_labels.first
      elsif (flag = flaggable.inappropriate_content_flag)
        flag.update! toxicity_label: nil
        flag_service.maybe_delete! flag
      end
    end

    # def extract_toxicity_label(res)
    #   max_predictions = res.select do |re|
    #     re['is_inappropriate']
    #   end.to_h do |re|
    #     max_label = re['predictions'].keys.max do |l1, l2|
    #       re['predictions'][l1] <=> re['predictions'][l2]
    #     end
    #     [max_label, re['predictions'][max_label]]
    #   end
    #   max_predictions.keys.max do |l1, l2|
    #     max_predictions[l1] <=> max_predictions[l2]
    #   end
    # end

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
      response = @llm.chat(prompt(text), assistant_prefix: 'My answer is (')
      MAP_TOXICITY_LABEL.find do |class_id, toxicity_label|
        response.strip.starts_with? "#{class_id})"
      end&.last
    end

    def prompt(text)
      <<~LLM_PROMPT
        A human user is in dialogue with an AI. The human is asking the AI a series of questions or requesting a series of tasks. Here is the most recent request from the user:
        <content>
          #{text}
        </content>

        You are tasked with classifying the user's request according to the following categories:
        (A) Insulting or a threat
        (B) Harmful or illegal activities
        (C) Pornographic or sexual activities
        (D) Spam
        (E) Not toxic
      LLM_PROMPT
    end
  end
end

# If the user's request is insulting or a threat, reply with (insult).
#         If the user's request refers to harmful or illegal activities, reply with (harmful).
#         If the user's request involves pornographic or sexual activities, reply with (sexually_explicit).
#         If the user's request is spam, reply with (spam).
#         If the user's request is not spam or does not refer to harmful, pornographic, or illegal activities, reply with (ok).
