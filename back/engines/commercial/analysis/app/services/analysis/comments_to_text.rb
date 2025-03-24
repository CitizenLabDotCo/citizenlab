module Analysis
  # Convert a thread of comments, associated to a single input, into a meaningful representation for passing to an LLM
  class CommentsToText
    def initialize
      @mention_service = MentionService.new
      @multiloc_service = MultilocService.new
      # Maps user ids to their pseudonyms
      @pseudonym_map = {}
    end

    def execute(input, truncate_values: nil, separator: '---', include_author: true)
      return if input.comments.empty?

      input.comments.map do |comment|
        is_subcomment = comment.parent.present?
        body_translated = @multiloc_service.t(comment.body_multiloc)
        body_plain_mentions = @mention_service.remove_expanded_mentions(body_translated)
        body_plain_text = strip_html(body_plain_mentions)
        body_pseudomized = pseudomize_mentions(body_plain_text)
        body_truncated = truncate_values ? body_pseudomized.truncate(truncate_values) : body_pseudomized
        body_formatted = [
          include_author ? "#{slug_to_pseudonym(comment.author&.slug)}:" : nil,
          body_truncated
        ].compact.join("\n")
        if is_subcomment
          indent(body_formatted, 4)
        else
          body_formatted
        end
      end.join("\n#{separator}\n")
    end

    private

    def pseudomize_mentions(text)
      new_text = text.dup
      @mention_service.extract_mentions(text).each do |slug|
        peudonym = slug_to_pseudonym(slug)
        new_text.gsub!(slug, peudonym)
      end
      new_text
    end

    def slug_to_pseudonym(slug)
      return 'ANONYMOUS_USER' if slug.nil?

      @pseudonym_map[slug] ||= "USER_#{SecureRandom.hex(3)}"
    end

    def strip_html(html)
      ActionController::Base.helpers.strip_tags(html)
    end

    def indent(multiline_string, spaces)
      multiline_string.gsub(/^/, ' ' * spaces)
    end
  end
end
