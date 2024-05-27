# frozen_string_literal: true

module UserPasswordValidations
  extend ActiveSupport::Concern

  included do
    validates :password, length: { maximum: 72 }, allow_nil: true
    # Custom validation is required to deal with the
    # dynamic nature of the minimum password length.
    validate :validate_minimum_password_length
    validate :validate_password_not_common
  end

  private

  def validate_minimum_password_length
    return unless password && password.size < password_min_length

    errors.add(
      :password,
      :too_short,
      message: 'The chosen password is shorter than the minimum required character length',
      count: password_min_length
    )
  end

  def password_min_length
    AppConfiguration.instance.settings('password_login', 'minimum_length') || 0
  end

  def validate_password_not_common
    return unless password && CommonPassword.check(password)

    errors.add(
      :password,
      :too_common,
      message: 'The chosen password matched with our common password blacklist'
    )
  end
end
