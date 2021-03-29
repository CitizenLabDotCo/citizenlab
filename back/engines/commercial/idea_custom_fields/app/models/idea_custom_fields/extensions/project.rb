module IdeaCustomFields
  module Extensions
    module Project
      def self.included(base)
        base.class_eval do
          belongs_to :custom_form,
                     class_name: 'IdeaCustomFields::CustomForm',
                     foreign_key: 'idea_custom_fields_custom_form_id',
                     optional: true,
                     dependent: :destroy
        end
      end
    end
  end
end
