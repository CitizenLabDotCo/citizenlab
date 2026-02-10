# frozen_string_literal: true

# == Schema Information
#
# Table name: baskets
#
#  id           :uuid             not null, primary key
#  submitted_at :datetime
#  user_id      :uuid
#  phase_id     :uuid
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_baskets_on_phase_id      (phase_id)
#  index_baskets_on_submitted_at  (submitted_at)
#  index_baskets_on_user_id       (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Basket < ApplicationRecord
  include LocationTrackableParticipation
  belongs_to :phase

  belongs_to :user, optional: true

  has_many :baskets_ideas, -> { order(:created_at) }, dependent: :destroy, inverse_of: :basket
  has_many :ideas, through: :baskets_ideas
  has_many :notifications, dependent: :destroy

  validates :phase, presence: true
  validate :basket_submission, on: :basket_submission

  scope :submitted, -> { where.not(submitted_at: nil) }
  scope :not_submitted, -> { where(submitted_at: nil) }

  delegate :project_id, :project, to: :phase

  def submitted?
    !!submitted_at
  end

  def total_votes
    baskets_ideas.pluck(:votes).sum
  end

  def destroy_or_keep!
    if submitted? && TimelineService.new.phase_is_complete?(phase)
      update!(user: nil)
    else
      destroy!
      update_counts!
    end
  end

  def update_counts!
    self.class.update_counts phase
  end

  class << self
    # NOTE: we cannot use counter_culture because we can't trigger it from another model being updated (basket)
    def update_counts(phase)
      project = phase.project

      # Update ideas
      update_ideas_counts('ideas', project.id)

      # Update ideas_phases
      update_ideas_counts('ideas_phases', project.id, phase.id)

      # Update the phase
      update_basket_and_vote_counts(phase, phase)

      # Update the project
      update_basket_and_vote_counts(project.phases, project)
    end

    private

    # NOTE: All ideas on the project are updated in case ideas have been removed from a basket or a basket is unpublished
    def update_ideas_counts(table, project_id, phase_id = nil)
      table_id = table == 'ideas' ? 'id' : 'idea_id'
      query = "
      UPDATE #{table}
      SET
        baskets_count = counts.baskets_count,
        votes_count = COALESCE(counts.votes_count, 0)
      FROM (
        SELECT
          i.id AS idea_id,
          COUNT(b.id) AS baskets_count,
          SUM(CASE WHEN b.id IS NOT NULL THEN bi.votes END) AS votes_count
        FROM ideas i
        LEFT OUTER JOIN baskets_ideas bi ON i.id = bi.idea_id
        LEFT OUTER JOIN baskets b ON bi.basket_id = b.id AND b.submitted_at IS NOT NULL"
      query += " AND b.phase_id = '#{phase_id}'" if phase_id
      query += "
        WHERE i.project_id = '#{project_id}'
        GROUP BY i.id
      ) AS counts
      WHERE #{table}.#{table_id} = counts.idea_id
    "
      query += " AND #{table}.phase_id = '#{phase_id}'" if phase_id
      ActiveRecord::Base.connection.execute(query)
    end

    def update_basket_and_vote_counts(count_phases, update_context)
      baskets = Basket.where(phase: count_phases).submitted
      baskets_count = baskets.count
      votes_count = BasketsIdea.where(basket: baskets).sum(:votes)
      update_context.update!(baskets_count: baskets_count, votes_count: votes_count)
    end
  end

  private

  def basket_submission
    return unless submitted?

    if baskets_ideas.size < phase.voting_min_selected_options
      errors.add(
        :baskets_ideas, :greater_than_or_equal_to, value: baskets_ideas.size, count: phase.voting_min_selected_options,
        message: "must be greater than or equal to #{phase.voting_min_selected_options}"
      )
    elsif phase.voting_min_total && (total_votes < phase.voting_min_total)
      errors.add(
        :total_votes, :greater_than_or_equal_to, value: total_votes, count: phase.voting_min_total,
        message: "must be greater than or equal to #{phase.voting_min_total}"
      )
    elsif phase.voting_max_total && (total_votes > phase.voting_max_total)
      errors.add(
        :total_votes, :less_than_or_equal_to, value: total_votes, count: phase.voting_max_total,
        message: "must be less than or equal to #{phase.voting_max_total}"
      )

    end

    max_votes = phase.voting_max_votes_per_idea
    return unless max_votes

    baskets_ideas.each do |baskets_idea|
      if baskets_idea.votes > max_votes
        errors.add(
          :baskets_ideas, :less_than_or_equal_to, value: baskets_idea.votes, count: max_votes, idea_id: baskets_idea.idea_id,
          message: "must be less than or equal to #{max_votes}"
        )
      end
    end
  end
end
