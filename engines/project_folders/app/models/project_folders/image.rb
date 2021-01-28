module ProjectFolders
  class Image < ::ApplicationRecord
    mount_base64_uploader :image, ImageUploader
    belongs_to :project_folder, class_name: 'Folder', foreign_key: 'project_folder_id' # todo rename to :folder

    validates :project_folder, presence: true
    validates :ordering, numericality: {only_integer: true}, allow_nil: true
  end
end