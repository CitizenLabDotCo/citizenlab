module Tagging
  class Tag < ApplicationRecord
    include PgSearch

    has_many :taggings, dependent: :destroy
    has_many :ideas, through: :taggings
    has_and_belongs_to_many :pending_tasks

    validates :title_multiloc, presence: true, multiloc: {presence: true}


    pg_search_scope :search_by_all,
                    against: [:title_multiloc],
                    using: { tsearch: {prefix: true} }

    before_validation :strip_title

    private

    def strip_title
      title_multiloc.each do |key, value|
        title_multiloc[key] = value.strip
      end
    end
  end
end
