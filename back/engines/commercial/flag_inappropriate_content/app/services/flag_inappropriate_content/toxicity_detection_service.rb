module FlagInappropriateContent
  class ToxicityDetectionService
    def flag_toxicity! obj, attributes: []
      return if !AppConfiguration.instance.feature_activated? 'flag_inappropriate_content'

      texts = extract_texts obj, attributes
      return if texts.blank?
      res = request_toxicity_detection texts
      create_or_update_flag_toxicity! obj, res if toxicity_detected? res
    end

    def extract_toxicity_label res
      max_predictions = res.select do |re|
        re['is_inappropriate']
      end.map do |re|
        max_label = re['predictions'].keys.max do |l1, l2|
          re['predictions'][l1] <=> re['predictions'][l2]
        end
        [max_label, re['predictions'][max_label]]
      end.to_h
      max_predictions.keys.max do |l1, l2|
        max_predictions[l1] <=> max_predictions[l2]
      end
    end

    private

    def extract_texts obj, attributes
      texts = []
      attributes.each do |atr|
        next if obj[atr].blank?
        values = if atr.to_s.ends_with? '_multiloc'
          texts += obj[atr].values
        else
          texts += [obj[atr]]
        end
      end
      texts.compact! # until nil values in multilocs is fixed
      texts
    end

    def request_toxicity_detection texts
      @api ||= NLP::API.new ENV.fetch('CL2_NLP_HOST')
      @api.toxicity_detection texts
    end

    def toxicity_detected? res
      res.any?{|h| h['is_inappropriate']}
    end

    def create_or_update_flag_toxicity! obj, res
      reuse_flag = obj.inappropriate_content_flag
      flag = reuse_flag || InappropriateContentFlag.new(flaggable: obj)
      flag.toxicity_label = extract_toxicity_label res
      flag.deleted_at = nil # re-introduce flag if it was marked as deleted
      flag.save!
      LogActivityJob.perform_later(flag, 'created', nil, flag.created_at.to_i) if !reuse_flag
      LogActivityJob.perform_later(obj, 'flagged_for_inappropriate_content', nil, flag.created_at.to_i)
    end
  end
end
