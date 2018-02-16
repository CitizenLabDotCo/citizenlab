class Invite < ApplicationRecord
  belongs_to :inviter, class_name: 'User'
  belongs_to :invitee, class_name: 'User'

  validates :token, presence: true, uniqueness: true
  validates :inviter, presence: true
  validates :invitee, presence: true, uniqueness: true

  before_validation :generate_token, on: :create


  private

  def generate_token
    self.token ||= ([*('a'..'z'),*('0'..'9')]).sample(8).join
  end

end