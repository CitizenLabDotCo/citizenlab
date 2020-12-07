class Invite < ApplicationRecord
  include PgSearch

  pg_search_scope :search_by_all, {
    :associated_against => { invitee: [:first_name, :last_name, :email] },
    :using => { :tsearch => {:prefix => true} }
  }

  belongs_to :inviter, class_name: 'User', optional: true
  belongs_to :invitee, class_name: 'User'
  before_destroy :remove_notifications
  has_many :notifications, foreign_key: :invite_id, dependent: :nullify

  validates :token, presence: true, uniqueness: true
  validates :invitee, presence: true, uniqueness: true
  validates :send_invite_email, inclusion: [true, false]

  before_validation :generate_token, on: :create
  before_validation :sanitize_invite_text, if: :invite_text
  after_destroy :destroy_invitee, if: :pending?

  private

  def pending?
    !self.accepted_at
  end

  def destroy_invitee
    self.invitee.destroy
  end

  def generate_token
    self.token ||= InvitesService.new.generate_token
  end

  def sanitize_invite_text
    service = SanitizationService.new
    self.invite_text = service.sanitize(
      self.invite_text,
      %i{decoration link}
    )
    self.invite_text = service.remove_empty_trailing_tags(self.invite_text)
    self.invite_text = service.linkify(self.invite_text)
  end

  def remove_notifications
    notifications.each do |notification|
      if !notification.update invite_id: nil
        notification.destroy!
      end
    end
  end

end
