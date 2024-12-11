# frozen_string_literal: true

class AnonymizeUserService
  def initialize
    # CSV files are generated from Google Sheets found in this Google Drive folder:
    # https://drive.google.com/drive/folders/10LnSF5kzONn8cgFuCj37E3zzhBK8V120?usp=sharing
    @first_names = load_csv 'first_names.csv'
    @male_first_names = @first_names.select { |d| d['gender'] == 'male' }
    @female_first_names = @first_names.select { |d| d['gender'] == 'female' }
    @last_names = load_csv 'last_names.csv'
    @avatars = load_csv 'avatars.csv'
    @male_avatars = @avatars.select { |d| d['gender'] == 'male' }
    @female_avatars = @avatars.select { |d| d['gender'] == 'female' }
    @initials_avatars_url =
      'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/avatars/initials_avatars/'
  end

  def load_csv(filename)
    CSV.read(
      Rails.root.join('config', 'anonymize_users', filename),
      headers: true, col_sep: ',', converters: []
    ).map(&:to_h)
  end

  def anonymized_attributes(locales, user: nil, start_at: nil)
    locale = locales.sample
    custom_field_values = random_custom_field_values user: user
    gender = custom_field_values['gender']
    first_name = random_first_name gender
    last_name = random_last_name locale
    email = random_email first_name, last_name
    avatar = random_avatar_assignment first_name, last_name, gender
    bio = random_bio locales
    registration = if start_at.present?
      random_registration user: user, start_at: start_at
    else
      random_registration user: user
    end

    {
      'first_name' => first_name,
      'last_name' => last_name,
      'email' => email,
      'password' => SecureRandom.urlsafe_base64(32),
      'locale' => locale,
      'custom_field_values' => custom_field_values,
      'bio_multiloc' => bio,
      'registration_completed_at' => registration,
      'created_at' => registration,
      'verified' => random_verified,
      **avatar
    }
  end

  private

  def random_custom_field_values(user: nil)
    custom_field_values = {}
    if user
      properties = %w[gender education birthyear]
      user[:custom_field_values].each do |property, value|
        if properties.include? property
          custom_field_values[property] = value
        end
      end
    end
    custom_field_values['gender'] ||= User::GENDERS.sample
    custom_field_values['birthyear'] ||= random_birthyear
    custom_field_values['education'] ||= rand(2..8).to_s
    custom_field_values
  end

  def mismatch_gender(gender)
    User::GENDERS.reject { |g| g == gender }.sample
  end

  def random_birthyear
    min_age, max_age = weighted_choice({
      [14, 20] => 7,
      [20, 30] => 22,
      [30, 40] => 32,
      [40, 50] => 25,
      [50, 60] => 15,
      [60, 70] => 10,
      [70, 80] => 5,
      [80, 90] => 3,
      [90, 100] => 1
    })
    age = rand(max_age - min_age) + min_age
    Time.zone.today.year - age
  end

  # Weighted random sampling [Efraimidis, Spirakis - 2006]
  def weighted_choice(weighted)
    weighted.max_by { |_, weight| rand**(1.0 / weight) }.first
  end

  def random_first_name(gender)
    gender = mismatch_gender(gender) if rand(30) == 0
    case gender
    when 'male'
      @male_first_names.sample
    when 'female'
      @female_first_names.sample
    else
      @first_names.sample
    end['first_name']
  end

  def random_last_name(_locale)
    @last_names.sample['last_name']
  end

  def random_email(first_name, last_name)
    email = Faker::Internet.email name: "#{first_name} #{last_name}"
    "#{email.split('@').first}_#{SecureRandom.uuid[...6]}@anonymized.com"
  end

  def random_avatar_assignment(first_name, last_name, gender)
    gender = mismatch_gender(gender) if rand(30) == 0

    if rand(5) == 0
      { 'remote_avatar_url' => random_face_avatar_url(gender) }
    else
      { 'remote_avatar_url' => "#{@initials_avatars_url}#{(first_name[0] + last_name[0]).downcase}_avatar.png" }
    end
  rescue StandardError => e
    ErrorReporter.report e
    {}
  end

  def random_face_avatar_url(gender)
    case gender
    when 'male'
      @male_avatars.sample
    when 'female'
      @female_avatars.sample
    else
      @avatars.sample
    end['avatar_url']
  end

  def random_bio(locales)
    bios = %w[greek hipster movie rick_and_morty game_of_thrones nil]
    locales.to_h do |locale|
      bio = case bios.sample
      when 'greek'
        Faker::GreekPhilosophers.quote
      when 'hipster'
        Faker::Hipster.paragraph
      when 'movie'
        Faker::Movie.quote
      when 'rick_and_morty'
        Faker::TvShows::RickAndMorty.quote
      when 'game_of_thrones'
        Faker::TvShows::GameOfThrones.quote
      when 'nil'
        ''
      end
      [locale, bio]
    end
  end

  def random_registration(user: nil, start_at: (Time.now - 1.month))
    if user
      user[:registration_completed_at]
    else
      Faker::Date.between(from: start_at, to: Time.now)
    end
  end

  def random_verified
    weighted_choice({
      false => 3,
      true => 1
    })
  end
end
