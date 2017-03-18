class Topic < ApplicationRecord
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, presence: true, multiloc: {presence: false}
  #TODO Settle on iconset and validate icon to be part of it

  has_many :labs_topics, dependent: :destroy
  has_many :labs, through: :labs_topics
end
