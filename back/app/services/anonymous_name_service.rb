# frozen_string_literal: true

class AnonymousNameService
  def initialize(user)
    @user = user
  end

  def first_name
    if scheme == 'animal'
      'Anonymous'
    else
      I18n.t 'user.anon_first_name'
    end
  end

  def last_name
    name_key = @user.email || @user.unique_code || @user.id

    # Put this in a service - AnonymousNameService
    if scheme == 'animal'
      names = %w[Aardvark Lion Platypus Giraffe Zebra]
      index = name_key.sum**2 % names.length
      names[index]
    else
      # Default is to generate a numeric last name in the format of '123456'
      (name_key.sum**2).to_s[0, 6] # Default
    end
  end

  def scheme
    @scheme ||= AppConfiguration.instance.settings('core', 'anonymous_name_scheme')
  end
end
