# frozen_string_literal: true

module PublicApi
  class FileAttachmentsFinder
    def execute
      file_attachments = @scope
      file_attachments = filter_by_attachable_type(file_attachments)
      file_attachments = filter_by_attachable_id(file_attachments)

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
  end
end