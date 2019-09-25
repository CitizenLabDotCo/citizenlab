User.class_eval do

  has_many :poll_responses, class_name: 'Polls::Response', dependent: :destroy

end