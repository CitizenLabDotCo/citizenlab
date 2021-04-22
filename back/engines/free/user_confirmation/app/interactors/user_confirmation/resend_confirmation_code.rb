module UserConfirmation
  class ResendConfirmationCode < ApplicationOrganizer
    organize ResetUserEmail,
             SendNewConfirmationCode
  end
end
