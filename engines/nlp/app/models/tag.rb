  class Tag < ApplicationRecord

    has_many :tag_assignments, dependent: :destroy
    has_many :ideas, through: :tag_assignments

    validates :title_multiloc, presence: true, multiloc: {presence: true}

    before_validation :strip_title

    private

    def strip_title
      title_multiloc.each do |key, value|
        title_multiloc[key] = value.strip
      end
    end
  end
