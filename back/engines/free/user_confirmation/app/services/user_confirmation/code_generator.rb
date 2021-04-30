module UserConfirmation
  class CodeGenerator
    include Callable

    def call
      result.code = random_code
    end

    def random_code
      rand.to_s[2..5]
    end
  end
end
