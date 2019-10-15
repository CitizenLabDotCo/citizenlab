User.class_eval do
  validates :verified, inclusion: {in: [true, false]}
  has_many :verifications, class_name: 'Verification::Verification', dependent: :destroy
end
