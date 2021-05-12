module FlagInappropriateContent
  class InappropriateContentFlag < ApplicationRecord
    belongs_to :flaggable, polymorphic: true

    validates :flaggable, presence: true


    def reason_code
      'inappropriate'
    end
     
  end
end
