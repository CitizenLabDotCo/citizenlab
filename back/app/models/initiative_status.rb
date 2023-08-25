# frozen_string_literal: true

# == Schema Information
#
# Table name: initiative_statuses
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb
#  description_multiloc :jsonb
#  ordering             :integer
#  code                 :string
#  color                :string
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
class InitiativeStatus < ApplicationRecord
  CODES = %w[review_pending changes_requested proposed expired threshold_reached answered ineligible custom].freeze

  REVIEW_CODES = %w[review_pending changes_requested].freeze
  NOT_REVIEW_CODES = (CODES - REVIEW_CODES).freeze

  has_many :initiative_status_changes, dependent: :nullify
  has_many :initiative_initiative_statuses

  has_many :initiatives, through: :initiative_initiative_statuses

  before_validation :strip_title
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, foreign_key: :post_status_id, dependent: :nullify

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :code, inclusion: { in: CODES }
  validates :code, uniqueness: true, unless: :custom?
  validates :description_multiloc, presence: true, multiloc: { presence: true }

  def self.initial_status_code
    Initiative.review_required? ? 'review_pending' : 'proposed'
  end

  def public?
    code.in?(NOT_REVIEW_CODES)
  end

  def custom?
    code == 'custom'
  end

  private

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update post_status: nil
        notification.destroy!
      end
    end
  end
end
