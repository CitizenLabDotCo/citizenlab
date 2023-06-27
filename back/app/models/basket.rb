# frozen_string_literal: true

# == Schema Information
#
# Table name: baskets
#
#  id                         :uuid             not null, primary key
#  submitted_at               :datetime
#  user_id                    :uuid
#  participation_context_id   :uuid
#  participation_context_type :string
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_baskets_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Basket < ApplicationRecord
  belongs_to :user
  belongs_to :participation_context, polymorphic: true

  has_many :baskets_ideas, -> { order(:created_at) }, dependent: :destroy, inverse_of: :basket
  has_many :ideas, through: :baskets_ideas
  accepts_nested_attributes_for :baskets_ideas, allow_destroy: true

  validates :user, :participation_context, presence: true
  validate :basket_submission, on: :basket_submission

  scope :submitted, -> { where.not(submitted_at: nil) }

  delegate :project_id, to: :participation_context

  def submitted?
    !!submitted_at
  end

  def total_votes
    baskets_ideas.pluck(:votes).sum
  end

  private

  def basket_submission
    return unless submitted?

    if participation_context.voting_min_total && (total_votes < participation_context.voting_min_total)
      errors.add(
        :total_votes, :greater_than_or_equal_to, value: total_votes, count: participation_context.voting_min_total,
        message: "must be greater than or equal to #{participation_context.voting_min_total}"
      )
    elsif participation_context.voting_max_total && (total_votes > participation_context.voting_max_total)
      errors.add(
        :total_votes, :less_than_or_equal_to, value: total_votes, count: participation_context.voting_max_total,
        message: "must be less than or equal to #{participation_context.voting_max_total}"
      )
    end
  end
end
