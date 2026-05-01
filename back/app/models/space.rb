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
  include PgSearch::Model

  has_many :projects, dependent: :nullify
  has_many :folders, dependent: :nullify, class_name: 'ProjectFolders::Folder'

  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  after_destroy :remove_moderators

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }

  pg_search_scope :search_by_title,
    against: :title_multiloc,
    using: { tsearch: { prefix: true } }

  private

  def remove_notifications
    notifications.each do |notification|
      notification.destroy! unless notification.update(space: nil)
    end
  end

  def remove_moderators
    User.space_moderator(id).each do |user|
      user.delete_role('space_moderator', space_id: id)
      user.save!
    end
  end
end
