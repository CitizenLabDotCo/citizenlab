module PublicApi
  class ApiToken < ApplicationRecord

    belongs_to :tenant, optional: true

    validates :secret, presence: true, length: {minimum: 20}

    before_validation :generate_secret, on: :create

    def authenticate(secret)
      self.secret == secret
    end

    def self.from_token_request request
      id = request.params["auth"] && request.params["auth"]["client_id"]
      self.find(id)
    end

    private
      def generate_secret
        self.secret ||= SecureRandom.urlsafe_base64(50)
      end

  end
end