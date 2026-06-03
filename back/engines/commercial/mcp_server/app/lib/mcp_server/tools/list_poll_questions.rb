# frozen_string_literal: true

class McpServer::Tools::ListPollQuestions < McpServer::BaseTool
  def name = 'list_poll_questions'
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
      scope = Polls::Question
        .where(phase_id: params[:phase_id])
        .order(:ordering)
        .includes(:options)

      paginated_response(
        'poll questions',
        scope,
        **params.slice(:page, :per_page),
        only: %i[id phase_id title_multiloc question_type max_options ordering],
        include: { options: { only: %i[id title_multiloc ordering] } }
      )
    end
  end
end
