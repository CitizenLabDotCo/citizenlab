module NLP
  module WebApi
    module V1
      class TagAssignmentsController < ApplicationController

        skip_after_action :verify_authorized, only: [:generate_tag_assignments]

        def generate_tag_assignments
          NLP::TagAssignmentSuggestionService.new.suggest(
            policy_scope(Idea).where(id: params['idea_ids']),
            Tag.where(id: params['tag_ids']),
            params['locale']).each { |document|
              Idea.find(document["id"]).update(tag_ids: document["predicted_labels"].map{|label| label["id"]})
            }
          head :ok
        end
      end

      private

      def secure_controller?
        false
      end
    end
  end
end
