# == Schema Information
#
# Table name: spaces
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb            not null
#  description_multiloc :jsonb            not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
class Space < ApplicationRecord
  has_many :projects, dependent: :nullify
  has_many :folders, dependent: :nullify, class_name: 'ProjectFolders::Folder'

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }
end
