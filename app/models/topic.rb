class Topic < ApplicationRecord
  has_many :projects_topics, dependent: :destroy
  has_many :projects, through: :projects_topics
  has_many :ideas_topics, dependent: :destroy
  has_many :ideas, through: :ideas_topics

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  #TODO Settle on iconset and validate icon to be part of it

  before_validation :strip_title


  private

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end
  
end
