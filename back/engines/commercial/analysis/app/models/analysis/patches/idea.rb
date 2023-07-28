# frozen_string_literal: true

module Analysis::Patches::Idea
  def self.included(base)
    base.class_eval do
      has_many :taggings, class_name: 'Analysis::Tagging', foreign_key: 'input_id', dependent: :destroy
    end
  end
end
