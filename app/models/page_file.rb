class PageFile < ApplicationRecord
	attr_accessor :filename
  mount_base64_uploader :file, PageFileUploader
  belongs_to :page

  validates :page, :file, :name, presence: true
end
