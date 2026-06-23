# frozen_string_literal: true

class McpServer::Tools::DestroyResource < McpServer::BaseTool
  RESOURCE_TYPES = {
    'project' => Project,
    'phase' => Phase,
    'event' => Event,
    'cause' => Volunteering::Cause,
    'poll_question' => Polls::Question,
    'poll_option' => Polls::Option
  }.freeze

  SIDE_FX_SERVICES = {
    Project => SideFxProjectService,
    Phase => SideFxPhaseService,
    Event => SideFxEventService,
    Volunteering::Cause => Volunteering::SideFxCauseService,
    Polls::Question => Polls::SideFxQuestionService,
    Polls::Option => Polls::SideFxOptionService
  }.freeze
  private_constant :SIDE_FX_SERVICES

  def name = 'destroy_resource'

  def description
    <<~DESC.squish
      Deletes a resource by id. Only works on resources whose target project is in draft.
      Destroying a project or a phase fails if any of its inputs would be deleted along with it.
    DESC
  end

  def input_schema
    {
      properties: {
        resource_type: { type: 'string', enum: RESOURCE_TYPES.keys },
        id: { type: 'string' }
      },
      required: %w[resource_type id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      authorize_project!(project_of(record))
      authorize(record, :destroy?)

      assert_can_destroy_project!(record) if record.is_a?(Project)
      assert_can_destroy_phase!(record) if record.is_a?(Phase)

      destroy_with_sidefx!(record)

      ok("Destroyed #{params[:resource_type]} #{params[:id]}")
    rescue ActiveRecord::RecordNotFound
      error("#{params[:resource_type].humanize} not found: #{params[:id]}")
    end

    private

    # For now, we don't allow destroying projects via the MCP if any inputs would be lost
    # in the cascade.
    def assert_can_destroy_project!(project)
      input_count = Idea.where(project: project).count
      return if input_count.zero?

      message = 'Cannot destroy project: it has inputs that would be deleted along with it.'
      raise Pundit::NotAuthorizedErrorWithReason, reason: message, message: message
    end

    # For now, we don't allow destroying phases via the MCP if destroying them would also
    # destroy inputs.
    def assert_can_destroy_phase!(phase)
      return unless phase.pmethod.destroy_ideas_on_phase_destroy?
      return unless phase.ideas.exists?

      message = 'Cannot destroy phase: it has inputs that would be deleted along with it.'
      raise Pundit::NotAuthorizedErrorWithReason, reason: message, message: message
    end

    def resource_class
      @resource_class ||= RESOURCE_TYPES.fetch(params[:resource_type])
    end

    def record
      @record ||= resource_class.find(params[:id])
    end

    def side_fx
      @side_fx ||= SIDE_FX_SERVICES.fetch(resource_class).new
    end

    def project_of(record)
      case record
      when Project then record
      when Phase, Event then record.project
      when Volunteering::Cause, Polls::Question then record.phase.project
      when Polls::Option then record.question.phase.project
      end
    end

    def destroy_with_sidefx!(record)
      side_fx.before_destroy(record, current_user)
      record.destroy!
      side_fx.after_destroy(record, current_user)
    end
  end
end
