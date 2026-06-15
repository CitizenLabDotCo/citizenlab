# frozen_string_literal: true

module UserPasswordValidations
  extend ActiveSupport::Concern

  included do
    validates :password, length: { maximum: 72 }, allow_nil: true
    # Custom validation is required to deal with the
    # dynamic nature of the minimum password length and strength.
    validate :validate_minimum_password_length
    validate :validate_password_not_common
    validate :validate_password_strength
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

  # Enforces a minimum zxcvbn strength score (0-4) when configured, in line with
  # NCSC guidance (strength via unpredictability, not composition rules).
  def validate_password_strength
    return unless password
    return if password_min_strength.zero?
    return if Zxcvbn.test(password, [email, first_name, last_name].compact).score >= password_min_strength

    errors.add(
      :password,
      :too_weak,
      message: 'The chosen password is too weak (too easy to guess)'
    )
  end

  def password_min_strength
    AppConfiguration.instance.settings('password_login', 'minimum_strength') || 0
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
