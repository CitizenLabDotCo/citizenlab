class Area < ApplicationRecord
  has_many :areas_projects, dependent: :destroy
  has_many :projects, through: :areas_projects
  has_many :areas_ideas, dependent: :destroy
  has_many :ideas, through: :areas_ideas

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}

  before_validation :strip_title


  private

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end
  
end
