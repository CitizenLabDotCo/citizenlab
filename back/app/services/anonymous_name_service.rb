# frozen_string_literal: true

class AnonymousNameService
  def initialize(user)
    @user = user
  end

  def first_name
    if scheme == 'animal'
      animal(@user.created_at.to_i)
    else
      I18n.t 'user.anon_first_name'
    end
  end

  def last_name
    if scheme == 'animal'
      animal(name_key.sum**2)
    else
      # Default is to generate a numeric last name in the format of '123456'
      (name_key.sum**2).to_s[0, 6] # Default
    end
  end

  private

  def animal(string_to_number)
    names = I18n.t('user.anon_scheme.animals', locale: @user.locale).split(',')
    index = string_to_number % names.length
    names[index].capitalize # Names should be capitalized in yml but just in case
  end

  def name_key
    @user.email || @user.unique_code || @user.id
  end

  def scheme
    @scheme ||= AppConfiguration.instance.settings('core', 'anonymous_name_scheme')
  end
end
