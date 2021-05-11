module FlagInappropriateContent
  class ToxicityDetectionService
    def flag_toxicity! obj, attributes: []
      return if !AppConfiguration.instance.feature_activated? 'flag_inappropriate_content'

      texts = extract_texts obj, attributes
      res = request_toxicity_detection texts
      create_or_update_flag_toxicity! obj, res if toxicity_detected? res
    end

    def extract_toxicity_label res
      # TODO
      'inflammatory'
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
      LogActivityJob.perform_later(obj, 'flagged_for_inappropriate_content', nil, Time.now.to_i)
    end
  end
end