# frozen_string_literal: true

module Analysis::Patches::Idea
  def self.included(base)
    base.class_eval do
      has_many :taggings, class_name: 'Analysis::Tagging', foreign_key: 'input_id', dependent: :destroy
      has_many :tags, class_name: 'Analysis::Tag', through: :taggings
    end
  end
end
