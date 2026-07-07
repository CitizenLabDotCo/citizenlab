# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal follows (`11---followers.csv`) ──▶ Go Vocal `Follower` on the corresponding Idea.
    #
    # Each row links a `user` to a `followable` (the proposal uid). We resolve the idea from the
    # followable and the user from `user`, both through the ref map, and register a `Follower`
    # referencing them. Runs after the proposals and users extractors so both resolve.
    #
    # A follow is skipped when:
    #   * its `followable` isn't an imported idea (e.g. a collaborative draft, which we don't import), or
    #   * its `user` wasn't imported (filtered spam/unconfirmed) — a `Follower` requires a user, unlike a
    #     comment which may be author-less, or
    #   * it duplicates an earlier (user, idea) follow (`Follower` is unique per user + followable).
    class FollowersExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        user: 'user',
        followable: 'followable',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
        @seen = Set.new
      end

      def run
        rows.filter_map { |row| build_follower(row) }
      end

      private

      def build_follower(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        idea = ref_map.fetch(present_value(row[COLUMNS[:followable]]))
        return skip(uid, 'followed proposal not imported') unless idea&.model_name == 'idea'

        user = ref_map.fetch(present_value(row[COLUMNS[:user]]))
        return skip(uid, 'follower user not imported') unless user&.model_name == 'user'

        return skip(uid, 'duplicate follow') unless @seen.add?([user.object_id, idea.object_id])

        follower = Record.new('follower', {
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        })
        follower.reference('followable', idea)
        follower.reference('user', user)
        ref_map.register(uid, follower)
      end

      def skip(uid, reason)
        @skipped << { uid: uid, reason: reason }
        nil
      end
    end
  end
end
