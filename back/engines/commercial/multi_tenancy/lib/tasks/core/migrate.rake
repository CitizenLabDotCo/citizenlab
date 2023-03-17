# frozen_string_literal: true

namespace :migrate do
  desc 'Define the default confirmation required value for existing users'
  task confirmation_required: %i[environment] do |_t, _args|
    Tenant.switch_each do
      registered_users = User.registered
      user_ids = registered_users.reject(&:should_require_confirmation?).map(&:id)

      User.where(id: user_ids).update_all(confirmation_required: false)
    end
  end
end
