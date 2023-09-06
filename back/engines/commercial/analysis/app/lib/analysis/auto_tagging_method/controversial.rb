# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Controversial < AutoTaggingMethod::Base
    THRESHOLD = 0.4
    TAG_TYPE = 'controversial'

    protected

    # Use `execute` on the parent class to actually use the method
    def run
      tag = Tag.find_or_create_by!(name: 'Controversial', tag_type: TAG_TYPE, analysis: analysis)

      filtered_inputs
        .order(published_at: :asc)
        .each.with_index do |input, _i|
        score = controversy_score(input)
        find_or_create_tagging!(input_id: input.id, tag_id: tag.id) if score > THRESHOLD
      end
    rescue StandardError => e
      raise AutoTaggingFailedError, e
    end

    private

    # from reddit: https://github.com/reddit-archive/reddit/blob/753b17407e9a9dca09558526805922de24133d53/r2/r2/lib/db/_sorts.pyx#L60
    def controversy_score(input)
      ups = input.likes_count
      downs = input.dislikes_count
      votes = ups + downs

      return 0 if ups <= 0 || downs <= 0 || votes < 5

      if ups > downs
        downs.to_f / ups
      else
        ups.to_f / downs
      end
    end
  end
end
