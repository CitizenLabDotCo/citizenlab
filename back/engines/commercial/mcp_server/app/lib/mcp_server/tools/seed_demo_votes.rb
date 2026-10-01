# frozen_string_literal: true

class McpServer::Tools::SeedDemoVotes < McpServer::BaseTool
  MAX_VOTERS_PER_CALL = 50

  def name = 'seed_demo_votes'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: false,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Seeds a voting phase with submitted votes: one basket per generated fake demo voter,
      with random picks that respect the phase's voting method and limits (budgeting,
      single or multiple voting), backdated over the phase's date range. Vote counts on
      inputs and results update accordingly. Only available on demo and trial platforms.
      Max #{MAX_VOTERS_PER_CALL} voters per call; call repeatedly for more.
    DESC
  end

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the voting phase.' },
        count: {
          type: 'integer',
          minimum: 1,
          maximum: MAX_VOTERS_PER_CALL,
          description: 'Number of demo voters to create (one submitted basket each).'
        }
      },
      required: %w[phase_id count],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Demo votes can only be created on demo and trial platforms.'
    STOP_PROBABILITY = 0.4

    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?
      return error('Phase is not a voting phase.') unless phase.participation_method == 'voting'

      ideas = votable_ideas(phase)
      return error('The phase has no published inputs to vote on.') if ideas.empty?

      ceiling_message = McpServer::DemoData.user_ceiling_error_message(params[:count])
      return error(ceiling_message) if ceiling_message

      authorize(phase.project, :update?)

      times = McpServer::DemoData.sample_times(
        params[:count],
        from: phase.start_at.in_time_zone,
        to: phase.end_at&.in_time_zone&.end_of_day || Time.zone.now,
        event_times: phase.project.events.pluck(:start_at)
      )
      # Fixed per-batch popularity weights, so results show clear winners.
      weights = ideas.shuffle.each_with_index.to_h { |idea, index| [idea, ideas.size - index] }

      baskets = ActiveRecord::Base.transaction do
        times.map { |time| create_basket!(phase, weights, time) }.tap do
          Basket.update_counts(phase)
        end
      end

      response(
        "Created #{baskets.size} submitted demo baskets in phase #{phase.id}",
        structured: { basket_ids: baskets.map(&:id) }
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def votable_ideas(phase)
      ideas = phase.ideas.published
      phase.voting_method == 'budgeting' ? ideas.where.not(budget: nil) : ideas
    end

    def create_basket!(phase, weights, time)
      author = McpServer::DemoData.build_author(time - rand(72).hours)
      author.save!
      basket = Basket.create!(phase: phase, user: author, created_at: time, submitted_at: time)
      create_picks!(basket, phase, weights.dup, time)
      # The real submit-flow validation (min/max totals, min options) against the persisted picks.
      basket.save!(context: :basket_submission)
      basket
    end

    def create_picks!(basket, phase, candidates, time)
      total = 0
      picked = 0

      while candidates.any?
        idea = candidates.max_by { |_, weight| rand**(1.0 / weight) }.first
        candidates.delete(idea)

        votes = votes_for(idea, phase, total)
        next unless votes

        basket.baskets_ideas.create!(idea: idea, votes: votes, created_at: time)
        total += votes
        picked += 1
        break if minimums_met?(phase, picked, total) && rand < STOP_PROBABILITY
      end
    end

    def votes_for(idea, phase, total)
      max_total = phase.voting_max_total
      case phase.voting_method
      when 'budgeting'
        idea.budget if total + idea.budget <= max_total
      when 'single_voting'
        1 if max_total.nil? || total < max_total
      else
        remaining = max_total && (max_total - total)
        return if remaining && remaining < 1

        [rand(1..(phase.voting_max_votes_per_idea || 5)), remaining].compact.min
      end
    end

    def minimums_met?(phase, picked, total)
      picked >= phase.voting_min_selected_options &&
        (phase.voting_min_total.nil? || total >= phase.voting_min_total)
    end
  end
end
