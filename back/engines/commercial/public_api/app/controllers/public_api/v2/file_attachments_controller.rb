# frozen_string_literal: true

module PublicApi
  class V2::FileAttachmentsController < PublicApiController
    include DeletedItemsAction

    def index
      file_attachments = FileAttachmentsFinder.new(
        Files::FileAttachment.includes(:file, :attachable),
        **finder_params
      ).execute

      list_items(file_attachments, V2::FileAttachmentSerializer, includes: %i[file])
    end

    def show
      show_item Files::FileAttachment.find(params[:id]), V2::FileAttachmentSerializer
    end

    private

    def finder_params
      params
        .permit(:attachable_id, :attachable_type)
        .to_h
        .symbolize_keys
    end
  end
end
