# frozen_string_literal: true

# == Schema Information
#
# Table name: project_reviews
#
#  id           :uuid             not null, primary key
#  project_id   :uuid             not null
#  requester_id :uuid
#  reviewer_id  :uuid
#  approved_at  :datetime
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_project_reviews_on_project_id    (project_id) UNIQUE
#  index_project_reviews_on_requester_id  (requester_id)
#  index_project_reviews_on_reviewer_id   (reviewer_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (requester_id => users.id)
#  fk_rails_...  (reviewer_id => users.id)
#
class ProjectReview < ApplicationRecord
  belongs_to :project
  belongs_to :requester, class_name: 'User', optional: true
  belongs_to :reviewer, class_name: 'User', optional: true

  before_destroy :remove_notifications
  # `dependent` is handled by the `before_destroy` callback.
  has_many :notifications # rubocop:disable Rails/HasManyOrHasOneDependent

  validate :validate_create, on: :create
  validate :validate_update, on: :update
  validates :project_id, uniqueness: { case_sensitive: false } # UUIDs are case-insensitive

  def approved?
    approved_at.present?
  end

  def state
    approved? ? 'approved' : 'pending'
  end

  # @param [User] reviewer
  def approve!(reviewer)
    approve(reviewer)
    save!
  end

  def approve(reviewer)
    # We set `updated_at` explicitly to ensure it has the same value as `approved_at`.
    now = Time.current

    self.reviewer = reviewer
    self.approved_at = now
    self.updated_at = now
  end

  private

  def validate_reviewer
    return if reviewer.nil?
    return if reviewer.admin?
    return if reviewer.project_folder_moderator?(project.folder_id)

    errors.add(:reviewer, 'must be an admin or a moderator of the project folder')
  end

  def validate_create
    validate_reviewer

    if requester.nil?
      errors.add(:requester, 'must be present')
    elsif !UserRoleService.new.can_moderate_project?(project, requester)
      errors.add(:requester, 'must be able to moderate the project (admin or moderator)')
    end
  end

  def validate_update
    # We validate the reviewer only if it has changed to prevent the project review to
    # become invalid if the roles of the reviewer change.
    validate_reviewer if reviewer_changed?
    # The requester cannot be changed, but can be nullified.
    errors.add(:requester, 'cannot be changed') if requester_changed? && !requester.nil?
    errors.add(:project, 'cannot be changed') if project_changed?

    if approved_at_changed?
      if approved_at.nil?
        errors.add(:approved_at, 'cannot be removed once set (cannot remove approval)')
      end

      # The reviewer must be specified when approving.
      # (It can become nil afterwards if the user is deleted.)
      if approved_at_was.nil? && approved_at.present? && reviewer.nil?
        errors.add(:reviewer, 'must be present when approving')
      end

      if approved_at_was.present? && approved_at.present?
        # That is something we might reconsider, but for now we are not allowing.
        errors.add(:base, 'Project review is already approved')
      end
    elsif approved?
      # Once approved, the reviewer can only be nullified, not changed.
      if reviewer_changed? && reviewer.present?
        errors.add(:reviewer, 'cannot be changed')
      end
    end
  end

  def remove_notifications
    notifications.each do |notification|
      notification.destroy! unless notification.update(project_review: nil)
    end
  end
end
