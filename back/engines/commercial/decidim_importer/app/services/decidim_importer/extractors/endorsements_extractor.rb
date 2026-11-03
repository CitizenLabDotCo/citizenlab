# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal endorsements (`10---endorsements.csv`) ──▶ Go Vocal `Reaction` (mode `up`, a
    # "like") on the corresponding Idea. Runs after the proposals and users extractors.
    #
    # A `Reaction`'s user is optional, so an endorsement whose author wasn't imported (filtered
    # spam/unconfirmed) is kept author-less rather than dropped, preserving the like count. Skipped when
    # its `endorsement_for` isn't an imported idea, or it duplicates an earlier (user, idea) like
    # (`Reaction` is unique per user + reactable + mode).
    class EndorsementsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        author: 'author',
        reactable: 'endorsement_for',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

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

        idea = ref_map.fetch(present_value(row[COLUMNS[:reactable]]))
        return skip(uid, 'endorsed proposal not imported') unless idea&.model_name == 'idea'

        author = ref_map.fetch(present_value(row[COLUMNS[:author]]))
        author = nil unless author&.model_name == 'user'
        # A same-user like on the same idea is unique; author-less likes don't collide (nil user).
        return skip(uid, 'duplicate endorsement') if author && !@seen.add?([author.object_id, idea.object_id])

        reaction = Record.new('reaction', {
          'mode' => 'up',
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        })
        reaction.reference('reactable', idea)
        reaction.reference('user', author) if author
        ref_map.register(uid, reaction)
      end
    end
  end
end
