class CommonPassword < ApplicationRecord

  COMMON_PASSWORDS_FILE = './public/common_passwords/100k-most-used-passwords-NCSC.txt'

  acts_as_list column: :freq_ordering, top_of_list: 0, add_new_at: :bottom


  def self.initialize!
    CommonPassword.destroy_all
    pwds = open(COMMON_PASSWORDS_FILE).readlines.map.with_index do |password, index|
      CommonPassword.new password: password.strip, freq_ordering: index
    end
    # Bulk insert in one query
    CommonPassword.import pwds
  end

  def self.check password
    # Returns true when the password is common
    where(password: password).exists?
  end
  
end
