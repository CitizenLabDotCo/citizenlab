# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal comments ──▶ Go Vocal `Comment` (always on an idea — Go Vocal comments aren't
    # polymorphic).
    #
    # Two columns say what a comment hangs off: `root_commentable` (the proposal → idea) and
    # `commentable` (the proposal, or the parent comment for a reply). Rows are processed shallow-first
    # (`depth` ascending) so a parent is registered before its replies. Authors filtered from the user
    # import (spam/unconfirmed) leave the comment author-less, which Go Vocal allows.
    class CommentsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        body: 'body',
        author: 'author',
        commentable: 'commentable',
        root_commentable: 'root_commentable',
        depth: 'depth',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows
          .sort_by { |row| present_value(row[COLUMNS[:depth]]).to_i }
          .filter_map { |row| build_comment(row) }
      end

      private

      def build_comment(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        # Drop content-less locales (e.g. `<p><br></p>`) too, so a visually-empty comment is skipped
        # rather than aborting the import on Comment's body-presence validation.
        body = html_present_multiloc(multiloc(row[COLUMNS[:body]]))
        return skip(uid, 'blank body') if body.empty?

        idea = ref_map.fetch(present_value(row[COLUMNS[:root_commentable]]))
        return skip(uid, 'commented-on proposal not imported') if idea.nil?

        comment = Record.new('comment', {
          'body_multiloc' => body,
          'publication_status' => 'published',
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        })
        comment.reference('idea', idea)
        reference_author(comment, row)
        reference_parent(comment, row)
        ref_map.register(uid, comment)
      end

      def reference_author(comment, row)
        author = ref_map.fetch(present_value(row[COLUMNS[:author]]))
        comment.reference('author', author) if author&.model_name == 'user'
      end

      # A reply points `commentable` at its parent comment (≠ the root proposal); resolve it only when
      # the parent was itself imported.
      def reference_parent(comment, row)
        commentable = present_value(row[COLUMNS[:commentable]])
        root = present_value(row[COLUMNS[:root_commentable]])
        return if commentable.nil? || commentable == root

        parent = ref_map.fetch(commentable)
        comment.reference('parent', parent) if parent&.model_name == 'comment'
      end
    end
  end
end
