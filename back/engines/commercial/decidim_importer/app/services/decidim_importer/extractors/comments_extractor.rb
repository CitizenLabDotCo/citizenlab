# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal comments ──▶ Go Vocal `Comment` (always on an idea — Go Vocal comments aren't
    # polymorphic).
    #
    # The export links a comment to what it hangs off via two columns: `root_commentable` (always the
    # proposal) and `commentable` (the proposal for a top-level comment, or the parent comment for a
    # reply). We resolve the idea from `root_commentable` and the parent only when `commentable`
    # differs. Rows are processed shallow-first (`depth` ascending) so a parent comment is registered
    # before its replies.
    #
    # Authors that were filtered out of the user import (spam/unconfirmed) leave the comment
    # author-less, which Go Vocal allows.
    class CommentsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        body: 'body',
        author: 'author',
        commentable: 'commentable',
        root_commentable: 'root_commentable',
        depth: 'depth',
        created_at: 'created_at'
      }.freeze

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
      end

      def run
        rows
          .sort_by { |row| present_value(row[COLUMNS[:depth]]).to_i }
          .filter_map { |row| build_comment(row) }
      end

      private

      def build_comment(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        body = multiloc(row[COLUMNS[:body]])
        if body.empty?
          @skipped << { uid: uid, reason: 'blank body' }
          return nil
        end

        idea = ref_map.fetch(present_value(row[COLUMNS[:root_commentable]]))
        if idea.nil?
          @skipped << { uid: uid, reason: 'commented-on proposal not imported' }
          return nil
        end

        comment = Record.new('comment', {
          'body_multiloc' => body,
          'publication_status' => 'published',
          'created_at' => timestamp(row[COLUMNS[:created_at]])
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

      # A reply points `commentable` at its parent comment (≠ the root proposal). Resolve the parent
      # only when it was itself imported.
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
