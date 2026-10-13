# frozen_string_literal: true

class FeedbackPromptPolicy < ApplicationPolicy
  def show_next?
    FeedbackPrompt::PROMPTS.keys.any? { |key| FeedbackPrompt.askable?(key, user) }
  end

  def answer?
    owned_and_shown?
  end

  def dismiss?
    owned_and_shown?
  end

  private

  def owned_and_shown?
    user&.active? && record.user_id == user.id && record.shown?
  end
end
