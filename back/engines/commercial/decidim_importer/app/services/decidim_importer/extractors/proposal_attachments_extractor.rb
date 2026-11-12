# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal attachments (`06---attachments.csv`) ──▶ Go Vocal file attachments on the imported
    # `Idea`. Row's `attached_to` is the proposal uid (→ idea); shared record shape in {AttachmentExtractor}.
    #
    # Each proposal's card photo also becomes the idea's `IdeaImage`, besides staying a file. Decidim shows
    # a proposal's first photo (lowest weight, `Attachable#photo`) on its card; Go Vocal shows an idea's
    # first image on its card.
    class ProposalAttachmentsExtractor < AttachmentExtractor
      attaches_to 'idea', noun: 'proposal'

      CONTENT_TYPE_COLUMN = 'content_type'

      def run
        card_photo_rows.each { |row| build_idea_image(row) }
        super
      end

      private

      # The first photo of each imported proposal, by weight (an attachment without one sorts last).
      def card_photo_rows
        rows.each_with_index
          .select { |row, _| present_value(row[COLUMNS[:uid]]) && photo?(row) && imported_idea(row) }
          .group_by { |row, _| row[COLUMNS[:attached_to]] }
          .values
          .map { |pairs| pairs.min_by { |row, index| [ordering_for(row) || Float::INFINITY, index] }.first }
      end

      # A photo the way Decidim decides it (an image content type), and in a format `IdeaImage` accepts.
      # Exports without the content type column fall back to the extension alone.
      def photo?(row)
        url = present_value(row[COLUMNS[:file]])
        return false if url.nil?

        content_type = present_value(row[CONTENT_TYPE_COLUMN])
        return false if content_type && !content_type.start_with?('image/')

        BaseImageUploader::ALLOWED_TYPES.include?(url_extension(url).delete('.').downcase)
      end

      def imported_idea(row)
        record = ref_map.fetch(present_value(row[COLUMNS[:attached_to]]))
        record if record&.model_name == self.class.attachable_model
      end

      def build_idea_image(row)
        image = Record.new('idea_image', {
          'remote_image_url' => present_value(row[COLUMNS[:file]]),
          'ordering' => 0
        })
        image.reference('idea', imported_idea(row))
        ref_map.register("#{present_value(row[COLUMNS[:uid]])}-idea-image", image)
      end
    end
  end
end
