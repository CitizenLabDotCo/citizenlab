# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim budget orders (a budgets component's `NN---orders.csv`) ──▶ Go Vocal `Basket` (one per
    # order) plus a `BasketsIdea` per picked project.
    #
    # An order is a user's set of picks in a budget; it maps onto a basket in the component's voting
    # phase (registered under the component uid by {PhaseProjector}). `checked_out_at` — when the user
    # confirmed their vote — becomes the basket's `submitted_at` (blank for a still-pending order, i.e.
    # an unsubmitted basket, which the phase's basket/vote counts then ignore). Each project uid in the
    # order's `projects` JSON array becomes a `BasketsIdea` whose `votes` is that idea's `budget` (the
    # cost the budgeting method charges), so the basket's total is the sum of its picks' budgets.
    #
    # A basket needs no user (`Basket#user` is optional), so an order by a non-imported user is kept
    # user-less. Skipped when the order's phase wasn't imported, or when it duplicates an earlier
    # (user, phase) basket (`Basket` is unique per user + phase).
    class OrdersExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        process: 'decidim_participatory_process',
        component: 'decidim_component',
        user: 'user',
        projects: 'projects',
        checked_out_at: 'checked_out_at',
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
        rows.filter_map { |row| build_basket(row) }
      end

      private

      def build_basket(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        phase = ref_map.fetch(present_value(row[COLUMNS[:component]]))
        return skip(uid, 'no phase for order') unless phase&.model_name == 'phase'

        user = ref_map.fetch(present_value(row[COLUMNS[:user]]))
        user = nil unless user&.model_name == 'user'
        # A user has at most one basket per phase; user-less baskets (nil user) don't collide.
        return skip(uid, 'duplicate basket') if user && !@seen.add?([user.object_id, phase.object_id])

        created = timestamp(row[COLUMNS[:created_at]])
        basket = Record.new('basket', {
          'submitted_at' => timestamp(row[COLUMNS[:checked_out_at]]),
          'created_at' => created,
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        })
        basket.reference('phase', phase)
        basket.reference('user', user) if user
        ref_map.register(uid, basket)

        register_baskets_ideas(uid, basket, row, created)
        basket
      end

      # One `BasketsIdea` per picked project that resolves to an imported idea with a positive budget
      # (its `votes`). Projects that weren't imported, or carry no budget, are dropped from the basket.
      def register_baskets_ideas(uid, basket, row, created)
        project_uids(row).uniq.each do |project_uid|
          idea = ref_map.fetch(project_uid)
          next unless idea&.model_name == 'idea'

          budget = idea.attributes['budget'].to_i
          next unless budget.positive?

          baskets_idea = Record.new('baskets_idea', { 'votes' => budget, 'created_at' => created })
          baskets_idea.reference('basket', basket)
          baskets_idea.reference('idea', idea)
          ref_map.register("#{uid}-#{project_uid}", baskets_idea)
        end
      end

      def project_uids(row)
        parsed = parse_json_array(row[COLUMNS[:projects]])
        Array(parsed).filter_map { |value| present_value(value) }
      end

      def parse_json_array(value)
        return value if value.is_a?(Array)

        str = value.to_s.strip
        return [] unless str.start_with?('[')

        JSON.parse(str)
      rescue JSON::ParserError
        []
      end

      def skip(uid, reason)
        @skipped << { uid: uid, reason: reason }
        nil
      end
    end
  end
end
