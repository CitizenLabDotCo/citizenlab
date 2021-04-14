module UserConfirmation
  class CheckConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    def call

    end
  end
end
