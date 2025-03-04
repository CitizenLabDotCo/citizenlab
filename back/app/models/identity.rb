# frozen_string_literal: true

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

  class << self
    def find_or_build_with_omniauth(auth, authver_method)
      uid = authver_method.profile_to_uid(auth)
      find_with_omniauth(uid, auth) || build_with_omniauth(uid, auth, authver_method)
    end

    private

    def find_with_omniauth(uid, auth)
      find_by(uid: uid, provider: auth['provider'])
    end

    def build_with_omniauth(uid, auth, authver_method)
      auth_to_persist = authver_method.filter_auth_to_persist(auth)
      new(uid: uid, provider: auth['provider'], auth_hash: auth_to_persist)
    end
  end

  def email_always_present?
    AuthenticationService.new.method_by_provider(provider).email_always_present?
  end
end
