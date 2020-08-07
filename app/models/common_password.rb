class CommonPassword < ApplicationRecord

  acts_as_list column: :freq_ordering, top_of_list: 0, add_new_at: :bottom


  def self.check password
    # Returns true when the password is common
    where(password: password).exists?
  end
  
end
