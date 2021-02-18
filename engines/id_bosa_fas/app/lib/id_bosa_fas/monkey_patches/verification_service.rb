
module IdBosaFas
  module MonkeyPatches
    module VerificationService
      def all_methods
        super.push(IdBosaFas::BosaFasOmniauth.new)
      end
    end
  end
end