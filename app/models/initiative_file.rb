class InitiativeFile < ApplicationRecord

  MIME_TYPE_WHITELIST = [
    # text files
    'text/', 
    # PDF documents
    'application/pdf',
    # MS Office documents
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/word',
    'application/x-msword',
    'application/x-word',
    'application/excel',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/powerpoint',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    # LibreOffice documents
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    # iWork documents
    'application/x-iwork-pages-sffpages',
    'application/x-iwork-numbers-sffnumbers',
    'application/x-iwork-keynote-sffkey',
    # media files
    'audio/mp4',
    'audio/mpeg',
    'application/mp4',
    'video/mp4',
    'video/vnd.objectvideo',
    'video/x-msvideo',
    'video/x-matroska'
  ]

  mount_base64_uploader :file, InitiativeFileUploader
  belongs_to :initiative

  validates :initiative, :file, :name, presence: true
  validate :mime_type_whitelist



  private 

  def mime_type_whitelist
    if !MIME_TYPE_WHITELIST.any? { |item| self.file.content_type =~ /#{item}/ }
      self.errors.add(
        :file,
        :extension_whitelist_error,
        message: 'File MIME type is not supported'
      )
    end
  end
end
