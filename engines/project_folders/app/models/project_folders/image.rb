module ProjectFolders
  class Image < ::ApplicationRecord
    mount_base64_uploader :image, ImageUploader
    belongs_to :project_folder

    validates :project_folder, presence: true
    validates :ordering, numericality: {only_integer: true}, allow_nil: true
  end
end