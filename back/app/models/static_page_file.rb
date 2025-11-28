# frozen_string_literal: true

# == Schema Information
#
# Table name: static_page_files
#
#  id                                                                                     :uuid             not null, primary key
#  static_page_id                                                                         :uuid
#  file                                                                                   :string
#  ordering                                                                               :integer
#  name                                                                                   :string
#  created_at                                                                             :datetime         not null
#  updated_at                                                                             :datetime         not null
#  migrated_file_id(References the Files::File record after migration to new file system) :uuid
#  migration_skipped_reason                                                               :string
#
# Indexes
#
#  index_static_page_files_on_migrated_file_id  (migrated_file_id)
#  index_static_page_files_on_static_page_id    (static_page_id)
#
# Foreign Keys
#
#  fk_rails_...  (migrated_file_id => files.id)
#
class StaticPageFile < ApplicationRecord
  include FileMigratable

  attr_accessor :filename

  mount_base64_file_uploader :file, StaticPageFileUploader
  belongs_to :static_page

  validates :static_page, :name, presence: true
  validates :file, presence: true, unless: proc { Current.loading_tenant_template }
end
