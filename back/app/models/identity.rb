# == Schema Information
#
# Table name: identities
#
#  id         :uuid             not null, primary key
#  provider   :string
#  uid        :string
#  auth_hash  :jsonb
#  user_id    :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_identities_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Identity < ApplicationRecord
  belongs_to :user

  validates :uid, :provider, presence: true

  def self.find_with_omniauth(auth)
    find_by(uid: auth['uid'], provider: auth['provider'])
  end

  def self.create_with_omniauth(auth)
    create(uid: auth['uid'], provider: auth['provider'], auth_hash: auth)
  end
end
