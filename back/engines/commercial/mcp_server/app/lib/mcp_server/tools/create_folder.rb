# frozen_string_literal: true

class McpServer::Tools::CreateFolder < McpServer::BaseTool
  def name = 'create_folder'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: false,
      open_world_hint: true # Fetches `remote_header_bg_url` from an arbitrary public URL.
    }
  end

  def description
    <<~DESC.squish
      Creates a project folder to group related projects. Created as a draft; publish it from the
      admin UI once it has projects. Put a project in it by passing this folder's id as folder_id
      when you create the project (create_project).
    DESC
  end

  def input_schema
    {
      properties: {
        title_multiloc: { **multiloc_schema, description: 'Folder name.' },
        description_preview_multiloc: { **multiloc_schema, description: 'Short folder description shown on its card and page (HTML).' },
        remote_header_bg_url: { type: 'string', format: 'uri', description: 'Public URL of the image to download and use as the header background.' }
      },
      required: %w[title_multiloc],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      folder = ProjectFolders::Folder.new(
        **params,
        # A folder's admin_publication is mandatory and auto-built defaulting to 'published';
        # create it as a draft so publishing stays a deliberate action.
        admin_publication_attributes: { publication_status: 'draft' }
      )
      authorize(folder, :create?)

      folder.save!
      # SideFxProjectFolderService has no before_create; only after_create runs.
      ProjectFolders::SideFxProjectFolderService.new.after_create(folder, current_user)

      response(
        "Created folder #{folder.id}",
        structured: McpServer::Serializers::Folder.serialize(folder, params: { current_user: })
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end
  end
end
