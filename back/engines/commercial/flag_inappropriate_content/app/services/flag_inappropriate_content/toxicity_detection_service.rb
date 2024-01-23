# frozen_string_literal: true

module FlagInappropriateContent
  class ToxicityDetectionService
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
      if texts.any?(&method(:check_toxic?))
        flag_service.introduce_flag! flaggable, toxicity_label: 'toxicity'
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

    def check_toxic?(text)
      raw_label = @llm.chat(prompt(text))
      puts raw_label
      raw_label.strip == '(Y)'
    end

    def prompt(text)
      <<~LLM_PROMPT
        A human user is in dialogue with an AI. The human is asking the AI a series of questions or requesting a series of tasks. Here is the most recent request from the user:
        <content>
          #{text}
        </content>

        If the user's request refers to harmful, pornographic, or illegal activities, reply with (Y). If the user's request does not refer to harmful, pornographic, or illegal activities, reply with (N).
      LLM_PROMPT
    end
  end
end
