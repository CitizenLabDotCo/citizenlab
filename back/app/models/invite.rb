# frozen_string_literal: true

# == Schema Information
#
# Table name: invites
#
#  id                :uuid             not null, primary key
#  token             :string           not null
#  inviter_id        :uuid
#  invitee_id        :uuid             not null
#  invite_text       :string
#  accepted_at       :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  send_invite_email :boolean          default(TRUE), not null
#
# Indexes
#
#  index_invites_on_invitee_id  (invitee_id)
#  index_invites_on_inviter_id  (inviter_id)
#  index_invites_on_token       (token)
#
# Foreign Keys
#
#  fk_rails_...  (invitee_id => users.id)
#  fk_rails_...  (inviter_id => users.id)
#
class Invite < ApplicationRecord
  include PgSearch::Model

  EXPIRY_DAYS = 30
  NO_EXPIRY_BEFORE_CREATED_AT = Date.new(2023, 9, 18)

  pg_search_scope :search_by_all, {
    associated_against: { invitee: %i[first_name last_name email] },
    using: { tsearch: { prefix: true } }
  }

  belongs_to :inviter, class_name: 'User', optional: true
  belongs_to :invitee, class_name: 'User'

  has_many_text_images from: :invite_text, as: :text_images
  accepts_nested_attributes_for :text_images

  before_validation :generate_token, on: :create
  before_validation :sanitize_invite_text, if: :invite_text
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  validates :token, presence: true, uniqueness: true
  validates :invitee, presence: true, uniqueness: true
  validates :send_invite_email, inclusion: [true, false]

  after_destroy :destroy_invitee, if: :pending?

  private

  def pending?
    !accepted_at
  end

  def destroy_invitee
    invitee.destroy
  end

  def generate_token
    self.token ||= Invites::Service.new.generate_token
  end

  def sanitize_invite_text
    service = SanitizationService.new
    self.invite_text = service.sanitize(
      invite_text,
      %i[decoration link image]
    )
    self.invite_text = service.remove_empty_trailing_tags(invite_text)
    self.invite_text = service.linkify(invite_text)
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update invite: nil
        notification.destroy!
      end
    end
  end
end
