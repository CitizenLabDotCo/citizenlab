# frozen_string_literal: true

class McpServer::Tools::UpdateDemoInput < McpServer::BaseTool
  def name = 'update_demo_input'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Updates an existing input (idea or proposal) — its title, body, or status. Partial
      update: only the fields you pass change, and `*_multiloc` fields merge per locale.
      Meant for ideation and proposals inputs; survey responses cannot be edited after
      submission. Only available on demo and trial platforms.
    DESC
  end

  def input_schema
    {
      properties: {
        idea_id: { type: 'string', description: 'The ID of the input to update.' },
        title_multiloc: { **multiloc_schema, description: 'Input title.' },
        body_multiloc: { **multiloc_schema, description: 'Input body (HTML).' },
        status: {
          type: 'string',
          enum: McpServer::DemoData::SETTABLE_STATUS_CODES,
          description: "Status code for the input. Which codes are available depends on the input's " \
                       'participation method.'
        }
      },
      required: %w[idea_id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Demo inputs can only be updated on demo and trial platforms.'

    def run
      idea = Idea.find_by(id: params[:idea_id])
      return not_found_error('Input', params[:idea_id]) unless idea
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      authorize(idea, :update?)

      if params.key?(:status)
        statuses = McpServer::DemoData.settable_statuses(idea.participation_method_on_creation.idea_status_method)
        idea_status = statuses[params[:status]]
        unless idea_status
          available = statuses.any? ? " Available: #{statuses.keys.join(', ')}." : ''
          return error("Status '#{params[:status]}' is not available for this input.#{available}")
        end
        idea.idea_status = idea_status
      end

      idea.assign_attributes(merge_multilocs(idea, params.slice(:title_multiloc, :body_multiloc)))
      idea.save!

      response(
        "Updated input #{idea.id}",
        structured: McpServer::Serializers::Input.serialize(idea, params: { current_user: })
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end
  end
end
