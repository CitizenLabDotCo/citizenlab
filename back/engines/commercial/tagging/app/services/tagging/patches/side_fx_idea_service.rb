module Tagging
  module Patches
    module SideFxIdeaService
      def before_destroy(idea, _user)
        super
        Tagging.find(idea_id: idea.id).destroy_all
      rescue ActiveRecord::RecordNotFound => _e
      end
    end
  end
end
