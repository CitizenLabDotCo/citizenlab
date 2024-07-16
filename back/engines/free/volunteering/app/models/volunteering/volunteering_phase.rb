# frozen_string_literal: true

module Volunteering::VolunteeringPhase
  extend ActiveSupport::Concern

  included do
    has_many :causes, class_name: 'Volunteering::Cause', dependent: :destroy

    validate :causes_allowed_in_participation_method
  end

  def volunteering?
    participation_method == 'volunteering'
  end

  private

  def causes_allowed_in_participation_method
    return unless !volunteering? && causes.present?

    errors.add(:base, :cannot_contain_causes, causes_count: causes.size, message: 'cannot contain causes in the current non-volunteering participation context')
  end
end
