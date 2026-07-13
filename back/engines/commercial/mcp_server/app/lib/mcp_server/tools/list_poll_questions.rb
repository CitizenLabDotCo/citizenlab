# frozen_string_literal: true

class McpServer::Tools::ListPollQuestions < McpServer::BaseTool
  def name = 'list_poll_questions'
  def annotations = READ_ANNOTATIONS
  def title = 'List poll questions'
  def description = 'Lists poll questions for a phase, in display order, each with its answer options'

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the poll phase' },
        **PAGINATION_SCHEMA
      },
      required: %w[phase_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase
      return wrong_method_error(phase) unless phase.poll?

      scope = Polls::Question
        .where(phase_id: phase.id)
        .order(:ordering)
        .includes(:options)

      paginated_response(
        'poll questions',
        scope,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::PollQuestion
      )
    end

    private

    def wrong_method_error(phase)
      error(
        "Phase #{phase.id} has participation_method '#{phase.participation_method}', " \
        "but only 'poll' phases have poll questions."
      )
    end
  end
end
