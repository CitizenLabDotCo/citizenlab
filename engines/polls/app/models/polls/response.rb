module Polls
	class Response < ApplicationRecord

    belongs_to :user
    belongs_to :participation_context, polymorphic: true
    has_many :response_options, class_name: 'Polls::ResponseOption', dependent: :destroy

		validates :user, :participation_context, presence: true
		validates :user, uniqueness: {scope: [:participation_context]}
	end
end