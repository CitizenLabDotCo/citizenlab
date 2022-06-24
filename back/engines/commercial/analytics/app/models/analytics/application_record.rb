module Analytics
  class ApplicationRecord < ActiveRecord::Base
    self.abstract_class = true
    connects_to database: { writing: :analytics, reading: :analytics }

    def readonly?
      true
    end

  end
end
