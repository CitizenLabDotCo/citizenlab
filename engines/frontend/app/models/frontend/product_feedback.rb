module Frontend
  # Note: Not an ActiveRecord model, merely used for validations
  class ProductFeedback
    include ActiveModel::Model

    attr_accessor :question, :answer, :path, :locale, :email, :message

    validates :question, :answer, presence: true
    validates :locale, inclusion: { in: CL2_SUPPORTED_LOCALES.map(&:to_s) }, allow_nil: true
    validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }, allow_nil: true
    
    def attributes
      {
        "question" => question,
        "answer" => answer,
        "path" => path,
        "locale" => locale,
        "email" => email,
        "message" => message
      }
    end
  end
end