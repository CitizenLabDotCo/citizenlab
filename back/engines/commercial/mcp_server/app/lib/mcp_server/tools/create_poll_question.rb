# frozen_string_literal: true

class McpServer::Tools::CreatePollQuestion < McpServer::BaseTool
  def name = 'create_poll_question'
  def title = 'Create poll question'

  def description
    <<~DESC.squish
      Creates a question for a poll phase, optionally with its answer options in one call.
      Poll phases start empty — add one question per thing you want to ask. The phase's
      participation_method must be 'poll'. A question needs at least one option to be
      answerable; pass them via `options` here, or add them later with create_poll_option.
    DESC
  end

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the poll phase to add the question to.' },
        title_multiloc: { **multiloc_schema, description: 'Question title.' },
        question_type: {
          type: 'string',
          enum: Polls::Question::QUESTION_TYPES,
          description: "How many options a respondent may pick. Default: '#{Polls::Question.columns_hash['question_type'].default}'."
        },
        max_options: {
          type: 'integer',
          description: <<~DESC.squish
            Maximum number of options a respondent may select.
            Only applies when question_type is 'multiple_options'; leave unset for unlimited.
          DESC
        },
        options: {
          type: 'array',
          description: 'Answer options, in display order.',
          items: {
            type: 'object',
            properties: {
              title_multiloc: { **multiloc_schema, description: 'Option title.' }
            },
            required: %w[title_multiloc]
          }
        }
      },
      required: %w[phase_id title_multiloc]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find(params[:phase_id])
      return wrong_method_error(phase) unless phase.poll?

      question = build_question(phase)

      ActiveRecord::Base.transaction do
        Polls::SideFxQuestionService.new.before_create(question, current_user)
        question.save!
        Polls::SideFxQuestionService.new.after_create(question, current_user)

        Array(params[:options]).each { |option_params| create_option(question, option_params) }
      end

      ok(
        "Created poll question #{question.id} with #{question.options.size} option(s)",
        structured: serialize(question.reload)
      )
    rescue ActiveRecord::RecordNotFound
      error("Phase not found: #{params[:phase_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end

    private

    def build_question(phase)
      attributes = params.slice(:title_multiloc, :question_type, :max_options).compact
      Polls::Question.new(phase: phase, **attributes)
    end

    def create_option(question, option_params)
      option = Polls::Option.new(question: question, title_multiloc: option_params[:title_multiloc])
      Polls::SideFxOptionService.new.before_create(option, current_user)
      option.save!
      Polls::SideFxOptionService.new.after_create(option, current_user)
    end

    def serialize(question)
      question.as_json(
        only: %i[id phase_id title_multiloc question_type max_options ordering],
        include: { options: { only: %i[id title_multiloc ordering] } }
      )
    end

    def wrong_method_error(phase)
      error(
        "Phase #{phase.id} has participation_method '#{phase.participation_method}', " \
        "but poll questions can only be added to 'poll' phases."
      )
    end
  end
end
