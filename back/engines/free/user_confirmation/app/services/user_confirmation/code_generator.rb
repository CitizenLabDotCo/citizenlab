module UserConfirmation
  class CodeGenerator
    include Callable

    def call
      loop do
        code = random_code

        result.code = code unless existing_codes.include?(code)
      end
    end

    def existing_codes
      @existing_codes ||= User.pluck(:confirmation_code)
    end

    def random_code
      rand.to_s[2..8]
    end
  end
end
