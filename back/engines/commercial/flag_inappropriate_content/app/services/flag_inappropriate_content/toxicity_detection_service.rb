# frozen_string_literal: true

module FlagInappropriateContent
  class ToxicityDetectionService
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
      res = request_toxicity_detection texts
      if toxicity_detected? res
        flag_service.introduce_flag! flaggable, toxicity_label: (extract_toxicity_label(res) || 'without_label')
      elsif (flag = flaggable.inappropriate_content_flag)
        flag.update! toxicity_label: nil
        flag_service.maybe_delete! flag
      end
    end

    def extract_toxicity_label(res)
      max_predictions = res.select do |re|
        re['is_inappropriate']
      end.to_h do |re|
        max_label = re['predictions'].keys.max do |l1, l2|
          re['predictions'][l1] <=> re['predictions'][l2]
        end
        [max_label, re['predictions'][max_label]]
      end
      max_predictions.keys.max do |l1, l2|
        max_predictions[l1] <=> max_predictions[l2]
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

    def request_toxicity_detection(texts)
      @api ||= NLP::Api.new
      @api.toxicity_detection texts
    end

    def toxicity_detected?(res)
      res.any? { |h| h['is_inappropriate'] }
    end
  end
end
