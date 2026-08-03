# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim budget orders (`NN---orders.csv`) ──▶ Go Vocal `Basket` (one per order) plus a `BasketsIdea`
    # per picked project.
    #
    # An order maps onto a basket in the component's voting phase (registered under the component uid by
    # {PhaseProjector}). Only *submitted* orders are imported — Decidim marks a checked-out order
    # `finished` (a `pending` one was never submitted); `checked_out_at` becomes the basket's
    # `submitted_at`. Each project uid in the `projects` JSON array becomes a `BasketsIdea` whose `votes`
    # is that idea's `budget`.
    #
    # `Basket#user` is optional, so an order by a non-imported user is kept user-less. Skipped when it
    # wasn't submitted, the phase wasn't imported, or it duplicates an earlier (user, phase) basket.
    class OrdersExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        process: 'decidim_participatory_process',
        component: 'decidim_component',
        user: 'user',
        status: 'status',
        projects: 'projects',
        checked_out_at: 'checked_out_at',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      # Decidim's order status for a checked-out (submitted) order; `pending` orders were never submitted.
      SUBMITTED_STATUS = 'finished'

      def initialize(*args, **kwargs)
        super
        @seen = Set.new
      end

      def run
        rows.filter_map { |row| build_basket(row) }
      end

      private

      def build_basket(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        return skip(uid, 'order not submitted') unless submitted?(row)

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
        Array(Parsing.parse_json(row[COLUMNS[:projects]])).filter_map { |value| present_value(value) }
      end

      # Whether the order was submitted (checked out). Uses Decidim's `status` when present; older exports
      # without that column fall back to whether the order carries a checkout timestamp.
      def submitted?(row)
        status = present_value(row[COLUMNS[:status]])
        return status == SUBMITTED_STATUS if status

        present_value(row[COLUMNS[:checked_out_at]]).present?
      end
    end
  end
end
