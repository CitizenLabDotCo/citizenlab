class InitiativeStatus < ApplicationRecord

  CODES = %w(proposed expired threshold_reached answered ineligible custom)

  has_many :initiative_status_changes, dependent: :nullify
  has_many :initiative_initiative_statuses
  before_destroy :remove_notifications
  has_many :initiatives, through: :initiative_initiative_statuses
  has_many :notifications, foreign_key: :post_status_id, dependent: :nullify

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :code, inclusion: {in: CODES}
  validates :code, uniqueness: true, unless: :custom?
  validates :description_multiloc, presence: true, multiloc: {presence: true}

  before_validation :strip_title

  def custom?
    self.code == 'custom'
  end

  private

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

  def remove_notifications
    notifications.each do |notification|
      if !notification.update post_status: nil
        notification.destroy!
      end
    end
  end

end
