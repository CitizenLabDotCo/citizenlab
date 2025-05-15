# frozen_string_literal: true

# == Schema Information
#
# Table name: official_feedbacks
#
#  id              :uuid             not null, primary key
#  body_multiloc   :jsonb
#  author_multiloc :jsonb
#  user_id         :uuid
#  idea_id         :uuid
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_official_feedbacks_on_idea_id  (idea_id)
#  index_official_feedbacks_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (user_id => users.id)
#
class OfficialFeedback < ApplicationRecord
  belongs_to :idea
  counter_culture :idea

  belongs_to :user, optional: true

  before_validation :sanitize_body_multiloc
  before_validation :sanitize_author_multiloc
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  validates :body_multiloc, presence: true, multiloc: { presence: true, html: true }
  validates :author_multiloc, presence: true, multiloc: { presence: true }
  validates :idea, presence: true

  delegate :project_id, to: :idea

  private

  def sanitize_body_multiloc
    return unless body_multiloc&.any?

    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc body_multiloc, %i[mention]
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags body_multiloc
    self.body_multiloc = service.linkify_multiloc body_multiloc
    puts "Sanitized body_multiloc: #{body_multiloc}"
  end

  def sanitize_author_multiloc
    return unless author_multiloc&.any?

    self.author_multiloc = SanitizationService.new.sanitize_multiloc(
      author_multiloc,
      []
    )
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update official_feedback: nil
        notification.destroy!
      end
    end
  end
end
