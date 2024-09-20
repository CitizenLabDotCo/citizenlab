# frozen_string_literal: true

class AnonymousNameService
  def initialize(user)
    @user = user
  end

  def first_name
    if scheme == 'animal'
      names = I18n.t('user.anon_scheme.animal.first_names').split(',')
      index = (name_key.sum**2) % names.length
      names[index]
    else
      I18n.t 'user.anon_first_name'
    end
  end

  def last_name
    if scheme == 'animal'

      # TODO: JS - Use Faker::Creature::Animal.name

      names = I18n.t('user.anon_scheme.animal.last_names').split(',')
      index = (name_key.sum**2) % names.length
      names[index]
    else
      # Default is to generate a numeric last name in the format of '123456'
      (name_key.sum**2).to_s[0, 6] # Default
    end
  end

  private

  def name_key
    @user.email || @user.unique_code || @user.id
  end

  def scheme
    @scheme ||= AppConfiguration.instance.settings('core', 'anonymous_name_scheme')
  end
end
