# frozen_string_literal: true

class McpServer::Tools::DestroyResource < McpServer::BaseTool
  RESOURCE_TYPES = {
    'project' => Project,
    'folder' => ProjectFolders::Folder,
    'area' => Area,
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
    ProjectFolders::Folder => ProjectFolders::SideFxProjectFolderService,
    Area => SideFxAreaService,
    Phase => SideFxPhaseService,
    Event => SideFxEventService,
    Volunteering::Cause => Volunteering::SideFxCauseService,
    Polls::Question => Polls::SideFxQuestionService,
    Polls::Option => Polls::SideFxOptionService,
    Files::FileAttachment => Files::SideFxFileAttachmentService
  }.freeze
  private_constant :SIDE_FX_SERVICES

  # Deleting these stays a human action on live platforms: folders are navigation
  # structure, and deleting an area also deletes users' matching 'domicile' answers.
  DEMO_ONLY_TYPES = %w[folder area].freeze
  DEMO_ONLY_MESSAGE = 'Destroying %<type>ss via MCP is only available on demo and trial ' \
                      'platforms. On live platforms, %<type>s deletion stays a human ' \
                      'action in the admin UI.'

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
      Folders can only be destroyed on demo and trial platforms, and only when they contain
      no projects — move them out first (update_project's folder_id) or destroy them too.
      Areas can also only be destroyed on demo and trial platforms; destroying one detaches
      it from its projects and deletes users' matching 'domicile' answers.
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

      if DEMO_ONLY_TYPES.include?(params[:resource_type]) && !published_writable_platform?
        return error(format(DEMO_ONLY_MESSAGE, type: params[:resource_type]))
      end

      # Areas are platform-wide (no admin_publication), so the demo/trial gate above is
      # their whole MCP guard; the draft rule only applies to publication-owned records.
      authorize_project!(guard_target(record)) unless record.is_a?(Area)
      authorize(record, :destroy?)

      assert_can_destroy_project!(record) if record.is_a?(Project)
      assert_can_destroy_phase!(record) if record.is_a?(Phase)
      assert_can_destroy_folder!(record) if record.is_a?(ProjectFolders::Folder)

      destroy_with_sidefx!(record)

      response("Destroyed #{params[:resource_type]} #{params[:id]}")
    rescue ActiveRecord::RecordNotDestroyed => e
      # `dependent: :restrict_with_error` associations (e.g. a static page whose project
      # filter uses the area) block destruction with errors on the record.
      invalid_record_error(e.record)
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

    # The web UI cascades folder destruction to the contained projects; via the MCP we
    # refuse instead, so losing projects stays a deliberate, per-project action.
    def assert_can_destroy_folder!(folder)
      return unless folder.projects.exists?

      message = 'Cannot destroy folder: it contains projects. Move them out first ' \
                '(update_project with folder_id: null) or destroy them individually.'
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
