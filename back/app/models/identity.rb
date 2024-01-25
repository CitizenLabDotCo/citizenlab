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
      auth_to_persist = if authver_method.respond_to?(:filter_auth_to_persist)
        authver_method.filter_auth_to_persist(auth)
      else
        auth
      end

      uid = if authver_method.respond_to?(:profile_to_uid)
        authver_method.profile_to_uid(auth)
      else
        auth['uid']
      end
      find_with_omniauth(uid, auth) || build_with_omniauth(uid, auth_to_persist)
    end

    private

    def find_with_omniauth(uid, auth)
      find_by(uid: uid, provider: auth['provider'])
    end

    def build_with_omniauth(uid, auth)
      new(uid: uid, provider: auth['provider'], auth_hash: auth)
    end
  end

  def email_always_present?
    AuthenticationService.all_methods.fetch(provider).email_always_present?
  end
end
