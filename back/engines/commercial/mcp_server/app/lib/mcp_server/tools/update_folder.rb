# frozen_string_literal: true

class McpServer::Tools::UpdateFolder < McpServer::BaseTool
  def name = 'update_folder'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: true # Fetches `remote_header_bg_url` from an arbitrary public URL.
    }
  end

  def description
    <<~DESC.squish
      Updates a folder's name, description or header image. Partial update — only the fields you
      pass change, and `*_multiloc` fields merge per locale. Only available on demo and trial
      platforms. To move projects in or out of the folder, use update_project's folder_id.
    DESC
  end

  def input_schema
    folder_properties = McpServer::Tools::CreateFolder.new.input_schema[:properties]
    {
      properties: { folder_id: { type: 'string', description: 'The ID of the folder to update.' }, **folder_properties },
      required: %w[folder_id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      folder = ProjectFolders::Folder.find_by(id: params[:folder_id])
      return not_found_error('Folder', params[:folder_id]) unless folder

      return demo_only_error('Updating folders') unless published_writable_platform?

      authorize(folder, :update?)

      attributes = clear_uploaders!(folder, params.except(:folder_id))
      folder.assign_attributes(merge_multilocs(folder, attributes))

      side_fx = ProjectFolders::SideFxProjectFolderService.new
      side_fx.before_update(folder, current_user)
      folder.save!
      side_fx.after_update(folder, current_user)

      response(
        "Updated folder #{folder.id}",
        structured: McpServer::Serializers::Folder.serialize(folder, params: { current_user: })
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end
  end
end
