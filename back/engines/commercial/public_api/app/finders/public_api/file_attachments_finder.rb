# frozen_string_literal: true

module PublicApi
  class FileAttachmentsFinder < BaseFinder
    def execute
      file_attachments = @scope
      file_attachments = filter_by_attachable_type(file_attachments)
      file_attachments = filter_by_attachable_id(file_attachments)
      file_attachments = filter_by_project(file_attachments)
      file_attachments = filter_by_phase(file_attachments)
      file_attachments = filter_by_idea(file_attachments)
      
      file_attachments.order(created_at: :desc)
    end

    private

    def filter_by_attachable_type(file_attachments)
      return file_attachments unless @params[:attachable_type]
      
      file_attachments.where(attachable_type: @params[:attachable_type])
    end

    def filter_by_attachable_id(file_attachments)
      return file_attachments unless @params[:attachable_id]
      
      file_attachments.where(attachable_id: @params[:attachable_id])
    end

    def filter_by_project(file_attachments)
      return file_attachments unless @params[:project_id]
      
      file_attachments.joins(<<~SQL)
        LEFT JOIN ideas ON file_attachments.attachable_type = 'Idea' 
                        AND file_attachments.attachable_id = ideas.id
        LEFT JOIN phases ON file_attachments.attachable_type = 'Phase' 
                         AND file_attachments.attachable_id = phases.id
        LEFT JOIN events ON file_attachments.attachable_type = 'Event' 
                         AND file_attachments.attachable_id = events.id
      SQL
      .where(<<~SQL, project_id: @params[:project_id])
        file_attachments.attachable_type = 'Project' AND file_attachments.attachable_id = :