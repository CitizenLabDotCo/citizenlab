# == Schema Information
#
# Table name: public.common_passwords
#
#  id       :uuid             not null, primary key
#  password :string
#
# Indexes
#
#  index_common_passwords_on_password  (password)
#
class CommonPassword < ApplicationRecord

  COMMON_PASSWORDS_FILE = './public/common_passwords/100k-most-used-passwords-NCSC.txt'


  def self.initialize!
    CommonPassword.delete_all
    pwds = open(COMMON_PASSWORDS_FILE).readlines.map do |password|
      CommonPassword.new password: password.strip
    end
    # Bulk insert in one query
    CommonPassword.import pwds
  end

  def self.check password
    # Returns true when the password is common
    where(password: password).exists?
  end
  
end
