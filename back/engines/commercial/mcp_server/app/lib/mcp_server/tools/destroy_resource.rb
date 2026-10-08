# frozen_string_literal: true

class McpServer::Tools::DestroyResource < McpServer::BaseTool
  RESOURCE_TYPES = {
    'project' => Project,
    'phase' => Phase,
    'event' => Event,
    'cause' => Volunteering::Cause,
    'poll_question' => Polls::Question,
    'poll_option' => Polls::Option,
    'project_image' => ProjectImage,
    'event_image' => EventImage,
    'folder_image' => ProjectFolders::Image,
    'file_attachment' => Files::FileAttachment
  }.freeze

  SIDE_FX_SERVICES = {
    Project => SideFxProjectService,
    Phase => SideFxPhaseService,
    Event => SideFxEventService,
    Volunteering::Cause => Volunteering::SideFxCauseService,
    Polls::Question => Polls::SideFxQuestionService,
    Polls::Option => Polls::SideFxOptionService,
    Files::FileAttachment => Files::SideFxFileAttachmentService
  }.freeze
  private_constant :SIDE_FX_SERVICES

  def name = 'destroy_resource'

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
      Deletes a resource by id. Only works on resources whose target project or folder is
      in draft, except on demo and trial platforms, where published ones can be targeted too.
      Destroying a project or a phase fails if any of its inputs would be deleted along with it.
    DESC
  end

  def input_schema
    {
      properties: {
        resource_type: { type: 'string', enum: RESOURCE_TYPES.keys },
        id: { type: 'string' }
      },
      required: %w[resource_type id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      unless record
        return not_found_error("Resource (#{params[:resource_type]})", params[:id])
      end

      authorize_project!(guard_target(record))
      authorize(record, :destroy?)

      assert_can_destroy_project!(record) if record.is_a?(Project)
      assert_can_destroy_phase!(record) if record.is_a?(Phase)

      destroy_with_sidefx!(record)

      response("Destroyed #{params[:resource_type]} #{params[:id]}")
    end

    private

    # The record whose admin_publication the draft guard reads.
    def guard_target(record)
      case record
      when Files::FileAttachment then publication_owner_for(record.attachable)
      when ProjectFolders::Image then record.project_folder
      else publication_owner_for(record)
      end
    end

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
      return @record if defined?(@record)

      @record = resource_class.find_by(id: params[:id])
    end

    def side_fx
      return @side_fx if defined?(@side_fx)

      @side_fx = SIDE_FX_SERVICES[resource_class]&.new
    end

    def destroy_with_sidefx!(record)
      side_fx&.before_destroy(record, current_user)
      record.destroy!
      side_fx&.after_destroy(record, current_user)
    end
  end
end
