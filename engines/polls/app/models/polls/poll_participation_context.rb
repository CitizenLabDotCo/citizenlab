module Polls::PollParticipationContext
  extend ActiveSupport::Concern

  included do
    has_many :poll_questions, class_name: 'Polls::Question', as: :participation_context, dependent: :destroy
  end

  def poll?
    self.participation_method == 'poll'
  end

end