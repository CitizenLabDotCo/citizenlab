module NLP::IdeaDecorator
  extend ActiveSupport::Concern

  included do
    has_many :nlp_tag_assignments, class_name: 'NLP::TagAssignment', dependent: :destroy
    has_many :tags, through: :nlp_tag_assignment
  end

end
