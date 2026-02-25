# == Schema Information
#
# Table name: workspaces
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb            not null
#  description_multiloc :jsonb            not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
class Workspace < ApplicationRecord
  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }
end
