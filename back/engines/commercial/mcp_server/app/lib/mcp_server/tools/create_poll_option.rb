# frozen_string_literal: true

class McpServer::Tools::CreatePollOption < McpServer::BaseTool
  def name = 'create_poll_option'
  def title = 'Create poll option'

  def description
    <<~DESC.squish
      Adds an answer option to an existing poll question. The option is appended after
      the question's existing options. Use list_poll_questions to find question IDs.
    DESC
  end

  def input_schema
    {
      properties: {
        poll_question_id: { type: 'string', description: 'The ID of the poll question to add the option to.' },
        title_multiloc: { **multiloc_schema, description: 'Option title.' }
      },
      required: %w[poll_question_id title_multiloc]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      question = Polls::Question.find(params[:poll_question_id])
      option = Polls::Option.new(question: question, title_multiloc: params[:title_multiloc])

      Polls::SideFxOptionService.new.before_create(option, current_user)
      option.save!
      Polls::SideFxOptionService.new.after_create(option, current_user)

      ok(
        "Created poll option #{option.id}",
        structured: option.as_json(only: %i[id question_id title_multiloc ordering])
      )
    rescue ActiveRecord::RecordNotFound
      error("Poll question not found: #{params[:poll_question_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
