# frozen_string_literal: true

class McpServer::Tools::CreatePollOption < McpServer::BaseTool
  def name = 'create_poll_option'
  def title = 'Create poll option'

  def description
    <<~DESC.squish
      Adds an answer option to an existing poll question. By default the option is appended
      after the question's existing options; pass `ordering` to insert it at a specific
      zero-based position. Use list_poll_questions to find question IDs.
    DESC
  end

  def input_schema
    {
      properties: {
        question_id: { type: 'string', description: 'The ID of the poll question to add the option to.' },
        title_multiloc: { **multiloc_schema, description: 'Option title.' },
        ordering: { type: 'integer', description: "Zero-based position among the question's options. Defaults to the end." }
      },
      required: %w[question_id title_multiloc]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      question = Polls::Question.find(params[:question_id])
      option = Polls::Option.new(question: question, title_multiloc: params[:title_multiloc])

      Polls::SideFxOptionService.new.before_create(option, current_user)
      option.save!
      option.insert_at(params[:ordering]) if params[:ordering]
      Polls::SideFxOptionService.new.after_create(option, current_user)

      ok(
        "Created poll option #{option.id}",
        structured: McpServer::Serializers::PollOption.serialize(option.reload)
      )
    rescue ActiveRecord::RecordNotFound
      error("Poll question not found: #{params[:question_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
