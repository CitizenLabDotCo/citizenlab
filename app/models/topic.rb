class Topic < ApplicationRecord

  CODES = %w(mobility nature waste sustainability technology economy housing infrastructure security education culture health social citizenship services other custom)

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top
  
  has_many :projects_topics, dependent: :destroy
  has_many :projects, through: :projects_topics
  has_many :ideas_topics, dependent: :destroy
  has_many :ideas, through: :ideas_topics
  has_many :initiatives_topics, dependent: :destroy
  has_many :initiatives, through: :initiatives_topics

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :code, inclusion: {in: CODES}
  #TODO Settle on iconset and validate icon to be part of it

  before_validation :strip_title
  before_validation :set_code


  def custom?
    self.code == 'custom'
  end


  private

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

  def set_code
    self.code ||= 'custom'
  end
  
end
