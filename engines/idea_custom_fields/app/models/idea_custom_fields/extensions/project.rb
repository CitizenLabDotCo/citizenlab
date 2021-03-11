module IdeaCustomFields
  module Extensions
    module Project
      def self.included(base)
        base.class_eval do
          belongs_to :custom_form, optional: true, dependent: :destroy
        end
      end
    end
  end
end
