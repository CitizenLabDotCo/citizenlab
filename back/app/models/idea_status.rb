# frozen_string_literal: true

# == Schema Information
#
# Table name: idea_statuses
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb
#  ordering             :integer
#  code                 :string
#  color                :string
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  description_multiloc :jsonb
#  ideas_count          :integer          default(0)
#  participation_method :string           default("ideation"), not null
#
class IdeaStatus < ApplicationRecord
  CODES = %w[proposed threshold_reached expired viewed under_consideration accepted implemented rejected answered ineligible custom].freeze
  AUTOMATIC_STATUS_CODES = %w[proposed threshold_reached expired].freeze
  PROPOSED_CODE = 'proposed'

  acts_as_list column: :ordering, top_of_list: 0, scope: [:participation_method]

  default_scope -> { order(ordering: :asc) }

  has_many :ideas

  before_validation :strip_title
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, foreign_key: :post_status_id, dependent: :nullify

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, presence: true, multiloc: { presence: true }
  validates :code, presence: true, inclusion: { in: CODES }
  validates :color, presence: true
  validates :participation_method, presence: true, inclusion: { in: %w[ideation proposals] }

  def proposed?
    code == PROPOSED_CODE
  end

  def automatic?
    AUTOMATIC_STATUS_CODES.include? code
  end

  private

  def strip_title
    title_multiloc.each { |key, value| title_multiloc[key] = value.strip }
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update post_status: nil
        notification.destroy!
      end
    end
  end
end
