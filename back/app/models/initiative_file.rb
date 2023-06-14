# frozen_string_literal: true

# == Schema Information
#
# Table name: initiative_files
#
#  id            :uuid             not null, primary key
#  initiative_id :uuid
#  file          :string
#  name          :string
#  ordering      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_initiative_files_on_initiative_id  (initiative_id)
#
# Foreign Keys
#
#  fk_rails_...  (initiative_id => initiatives.id)
#
class InitiativeFile < ApplicationRecord
  mount_base64_file_uploader :file, InitiativeFileUploader
  belongs_to :initiative

  validates :initiative, :name, presence: true
  validates :file, presence: true, unless: proc { Current.loading_tenant_template }
end
