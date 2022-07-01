# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class UnsubscriptionTokens < Base
      def run
        User.find_each do |some_user|
          EmailCampaigns::UnsubscriptionToken.create!(user_id: some_user.id)
        end
      end
    end
  end
end
