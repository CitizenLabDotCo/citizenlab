module Verification
  module WebApi
    module V1
      class IdCardsController < VerificationController

        def bulk_replace
          authorize IdCard
          file = params[:id_cards][:file]
          parts = file.match(/\Adata:([-\w]+\/[-\w\+\.]+)?;base64,(.*)/m) || []
          if parts[2].present?
            IdCard.destroy_all
            CSV.parse(Base64.decode64(parts[2])) do |row|
              IdCard.create!(card_id: row[0]) if row[0].present?
            end
            head 201
          else
            head 422
          end
        end

        def count
          authorize IdCard
          render json: {count: IdCard.count}
        end

        private

        def secure_controller?
          true
        end
      end
    end
  end
end