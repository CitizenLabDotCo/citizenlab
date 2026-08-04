# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal notes ──▶ Go Vocal `InternalComment` (a private, admin-only note on an idea).
    #
    # A note hangs off its proposal (→ idea, resolved through the ref map) and is authored by an admin/
    # valuator. Unlike public `Comment`s, the body is a single plain-text string (not a multiloc) and the
    # notes aren't threaded, so each imported note is a flat, top-level internal comment. Authors filtered
    # from the user import leave the note author-less, which Go Vocal allows (`InternalComment#author` optional).
    class ProposalNotesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        proposal: 'proposal',
        author: 'author',
        body: 'body',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows.filter_map { |row| build_internal_comment(row) }
      end

      private

      def build_internal_comment(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        body = present_value(row[COLUMNS[:body]])
        return skip(uid, 'blank body') if body.nil?

        idea = ref_map.fetch(present_value(row[COLUMNS[:proposal]]))
        return skip(uid, 'noted proposal not imported') if idea.nil?

        internal_comment = Record.new('internal_comment', {
          'body' => body,
          'publication_status' => 'published',
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        })
        internal_comment.reference('idea', idea)
        reference_author(internal_comment, row)
        ref_map.register(uid, internal_comment)
      end

      def reference_author(internal_comment, row)
        author = ref_map.fetch(present_value(row[COLUMNS[:author]]))
        internal_comment.reference('author', author) if author&.model_name == 'user'
      end
    end
  end
end
