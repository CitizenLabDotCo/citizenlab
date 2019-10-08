User.class_eval do
  validates :verified, inclusion: {in: [true, false]}
end
