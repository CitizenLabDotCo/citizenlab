# frozen_string_literal: true

#
# Mixin for user participation in a model.
#
# ==== Usage (models only)
#
#     include ParticipationContext
#
module ParticipationContext
  extend ActiveSupport::Concern

  included do
    has_one :custom_form, as: :participation_context, dependent: :destroy
  end

  # TODO: JS - is this used?
  def reactions
    Reaction.where(reactable: ideas)
  end
end
