module Analytics
  class ApplicationRecord < ActiveRecord::Base
    self.abstract_class = true
    # establish_connection("development_analytics")
  end
end
