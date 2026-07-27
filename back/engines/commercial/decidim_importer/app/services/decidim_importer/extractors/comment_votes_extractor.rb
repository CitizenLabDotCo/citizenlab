# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim comment votes (`08---comments-votes.csv`) ──▶ Go Vocal `Reaction` on the `Comment`
    # (mode `up` for a like, `down` for a dislike). Runs after the comments and users extractors.
    #
    # A `Reaction`'s user is optional, so a vote whose author wasn't imported (filtered spam/unconfirmed)
    # is kept author-less rather than dropped, preserving the count. Skipped when its `comment` isn't an
    # imported comment, its `value` isn't a known mode, or it duplicates an earlier (user, comment, mode)
    # vote (`Reaction` is unique per user + reactable + mode).
    class CommentVotesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        comment: 'comment',
        author: 'author',
        value: 'value',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      MODES = %w[up down].freeze

      def initialize(*args, **kwargs)
        super
        @seen = Set.new
      end

      def run
        rows.filter_map { |row| build_reaction(row) }
      end

      private

      def build_reaction(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        comment = ref_map.fetch(present_value(row[COLUMNS[:comment]]))
        return skip(uid, 'voted comment not imported') unless comment&.model_name == 'comment'

        mode = present_value(row[COLUMNS[:value]])&.downcase
        return skip(uid, "unknown vote value #{row[COLUMNS[:value]].inspect}") unless MODES.include?(mode)

        author = ref_map.fetch(present_value(row[COLUMNS[:author]]))
        author = nil unless author&.model_name == 'user'
        # A same-user vote of the same mode on the same comment is unique; author-less votes don't collide.
        return skip(uid, 'duplicate comment vote') if author && !@seen.add?([author.object_id, comment.object_id, mode])

        reaction = Record.new('reaction', {
          'mode' => mode,
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        })
        reaction.reference('reactable', comment)
        reaction.reference('user', author) if author
        ref_map.register(uid, reaction)
      end
    end
  end
end
