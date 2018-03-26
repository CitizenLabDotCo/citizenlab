class Invite < ApplicationRecord
  include PgSearch

  pg_search_scope :search_by_all, {
    :associated_against => { invitee: [:first_name, :last_name, :email] },
    :using => { :tsearch => {:prefix => true} }
  }

  belongs_to :inviter, class_name: 'User', optional: true
  belongs_to :invitee, class_name: 'User'

  validates :token, presence: true, uniqueness: true
  validates :invitee, presence: true, uniqueness: true

  before_validation :generate_token, on: :create
  after_destroy :destroy_invitee, if: :pending?

  private

  def pending?
    !self.accepted_at
  end

  def destroy_invitee
    self.invitee.destroy
  end

  def generate_token
    self.token ||= ([*('a'..'z'),*('0'..'9')]).sample(8).join
  end

end