# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal votes (`NN---proposal-votes.csv`) ──▶ Go Vocal `Basket` (+ `BasketsIdea`s) in the
    # component's single-voting phase (registered under the component uid by {PhaseProjector} when the
    # component has votes).
    #
    # Decidim records one row per (voter, proposal); Go Vocal models a voter's picks as a *single*
    # submitted basket per (user, phase) holding one `BasketsIdea` (a single vote) per picked idea. So all
    # of a voter's rows in a component collapse into one basket, dated from those votes (earliest →
    # `created_at`, latest → `submitted_at`, which marks it submitted so the phase's counts include it).
    #
    # `Basket#user` is optional, so votes by a non-imported user (filtered spam/unconfirmed) still form a
    # user-less basket, preserving the tally (user-less baskets don't collide on the unique user+phase
    # index). Skipped when the component isn't a voting phase, or none of the voter's proposals were imported.
    class ProposalVotesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        component: 'decidim_component',
        proposal: 'proposal',
        author: 'author',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows.group_by { |row| [present_value(row[COLUMNS[:component]]), present_value(row[COLUMNS[:author]])] }
          .filter_map { |(component_uid, author_uid), votes| build_basket(component_uid, author_uid, votes) }
      end

      private

      def build_basket(component_uid, author_uid, votes)
        key = "#{component_uid}-basket-#{author_uid || votes.first[COLUMNS[:uid]]}"
        phase = ref_map.fetch(component_uid)
        return skip(key, 'no voting phase for proposal vote') unless voting_phase?(phase)

        picks = resolve_picks(votes)
        return skip(key, 'no imported proposal voted') if picks.empty?

        basket = build_basket_record(votes)
        basket.reference('phase', phase)
        author = ref_map.fetch(author_uid)
        basket.reference('user', author) if author&.model_name == 'user'
        ref_map.register(key, basket)

        register_baskets_ideas(basket, picks)
        basket
      end

      def voting_phase?(record)
        record&.model_name == 'phase' && record.attributes['participation_method'] == 'voting'
      end

      # The voter's picks, as `[idea, vote_date]` pairs — one per distinct imported idea (a repeated vote
      # for the same proposal, which Decidim shouldn't emit, collapses to one). Votes on proposals that
      # weren't imported are dropped.
      def resolve_picks(votes)
        picks = votes.filter_map do |vote|
          idea = ref_map.fetch(present_value(vote[COLUMNS[:proposal]]))
          next unless idea&.model_name == 'idea'

          [idea, timestamp(vote[COLUMNS[:created_at]])]
        end
        picks.uniq { |idea, _| idea.object_id }
      end

      # A submitted basket dated from the voter's votes: earliest → `created_at`, latest → `submitted_at`
      # (Decidim votes are final, so the basket counts as submitted at the last one).
      def build_basket_record(votes)
        dates = votes.filter_map { |vote| timestamp(vote[COLUMNS[:created_at]]) }.sort
        Record.new('basket', {
          'submitted_at' => dates.last, 'created_at' => dates.first, 'updated_at' => dates.last
        })
      end

      # One single vote (`votes` = 1) per picked idea — the single-voting method caps each idea at one.
      def register_baskets_ideas(basket, picks)
        picks.each do |idea, created|
          baskets_idea = Record.new('baskets_idea', { 'votes' => 1, 'created_at' => created })
          baskets_idea.reference('basket', basket)
          baskets_idea.reference('idea', idea)
          ref_map.register("#{basket.key}-#{idea.object_id}", baskets_idea)
        end
      end
    end
  end
end
