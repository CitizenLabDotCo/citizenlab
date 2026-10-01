# frozen_string_literal: true

class McpServer::Tools::SeedDemoReactions < McpServer::BaseTool
  MAX_REACTORS_PER_CALL = 50

  def name = 'seed_demo_reactions'

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
      Seeds an ideation or proposals phase with reactions from generated fake demo users:
      each reactor likes a few inputs (popular inputs get more likes, and dislikes appear
      when the phase allows them) and some of their comments, backdated after the reacted
      content. Proposals that cross their reacting threshold change status accordingly.
      Only available on demo and trial platforms.
      Max #{MAX_REACTORS_PER_CALL} reactors per call; call repeatedly for more.
    DESC
  end

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the ideation or proposals phase.' },
        count: {
          type: 'integer',
          minimum: 1,
          maximum: MAX_REACTORS_PER_CALL,
          description: 'Number of demo reactors to create (each reacts to several things).'
        }
      },
      required: %w[phase_id count],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Demo reactions can only be created on demo and trial platforms.'
    REACTING_PHASES = %w[ideation proposals].freeze
    DISLIKE_PROBABILITY = 0.1

    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      unless REACTING_PHASES.include?(phase.participation_method) && phase.reacting_enabled
        return error('Phase does not support reactions.')
      end

      ideas = phase.ideas.published.to_a
      return error('The phase has no published inputs to react to.') if ideas.empty?

      ceiling_message = McpServer::DemoData.user_ceiling_error_message(params[:count])
      return error(ceiling_message) if ceiling_message

      authorize(phase.project, :update?)

      comments = Comment.published.where(idea: ideas).to_a
      # Fixed per-batch popularity weights, so trending and most-liked show a clear order.
      weights = ideas.shuffle.each_with_index.to_h { |idea, index| [idea, ideas.size - index] }

      reactions_count = ActiveRecord::Base.transaction do
        count = params[:count].times.sum { create_reactor_reactions!(phase, weights, comments) }
        transition_statuses!(ideas) if phase.participation_method == 'proposals'
        count
      end

      response(
        "Created #{reactions_count} demo reactions in phase #{phase.id}",
        structured: { reactions_count: }
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def create_reactor_reactions!(phase, weights, comments)
      candidates = weights.dup
      idea_picks = Array.new(rand(1..[candidates.size, 5].min)) do
        candidates.max_by { |_, weight| rand**(1.0 / weight) }.first.tap { |idea| candidates.delete(idea) }
      end
      targets = idea_picks + comments.sample(rand(0..[2, comments.size].min))
      reactions = targets.index_with { |reactable| Faker::Time.between(from: reactable.created_at, to: Time.zone.now) }

      author = McpServer::DemoData.build_author(reactions.values.min - rand(72).hours)
      author.save!
      reactions.each do |reactable, time|
        mode = phase.reacting_dislike_enabled && reactable.is_a?(Idea) && rand < DISLIKE_PROBABILITY ? 'down' : 'up'
        Reaction.create!(reactable: reactable, user: author, mode: mode, created_at: time)
      end
      reactions.size
    end

    # The per-reaction call SideFxReactionService makes, applied once per input:
    # proposals that crossed their reacting threshold change status.
    def transition_statuses!(ideas)
      ideas.each { |idea| InputStatusService.auto_transition_input!(idea.reload) }
    end
  end
end
