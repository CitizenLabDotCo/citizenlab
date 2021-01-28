class AnonymizeUserService

  MALE_AVATAR_URLS = [
    'http://res.cloudinary.com/citizenlabco/image/upload/v1515573977/man-388104_960_720_dfehjy.jpg',
    'http://res.cloudinary.com/citizenlabco/image/upload/v1515574041/man-838636_960_720_f3i6ki.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/7ca644b8-4ebf-4e74-a266-c8f9f945fc28/profile-1474295964-7c5694e2fc409f9ba430e094fee7f906.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/7937ab55-2985-4d6e-a4ab-db25d605ef72/66c297f1dcd085d2304f63c5ed612c0a--beauty-portrait-male-portraits.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/84184598-6aac-408a-a49b-26ec0176a94b/49cd4c44d562e92d90a3a4c81ced02dc.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/f34ad5d9-c337-4f12-a084-9027ee484cb6/16992834140_99815ee4ac_m.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/d6684b22-b759-4e3e-8793-5029ff27ba25/bryan_cranston_0095.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/90095a74-7993-4bff-b47f-154faf3efebe/dof2.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/fc984a52-9e03-4407-a87c-75c956535a99/51DLRByNOXL._UX250_.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/e4a62fcc-498f-49d5-a374-f625a3075659/461482218-594x367.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/31bf5bfa-9cb8-49e6-a067-6dff9d1231fe/Prof_Ertl-Portrait.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/c969dc8b-a29a-4758-b38c-9c3a209aad50/500.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/241f271a-f5d5-47ec-a07f-17624e604e23/pexels-photo-247917.jpeg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/3a0daa4e-25b3-4087-b0a0-74681741f468/00d6436d2d9283f7ce61f87b07ae378e--portrait-men-male-portrait-photography.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/12831742-dc2c-4dd7-8896-d9ddb29a997a/017840b7be8c4a19c57fd213eb8377a0--portrait-photography-men-face-photography.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/54245944-8135-462a-b98f-24a75ed7c9b8/3df459479af007fed226ae39b9464af8--portrait-photography-men-photography-photos.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/25f8652e-62d1-4651-9ed3-449ba3174be2/black-white-portrait2.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/75616256-0236-4f3e-9027-66a0d40f46f5/csm_Karakasoglu_Yasemin1_360cb6e01f.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/8c5928c1-89b6-4b48-92d5-d751c1c13643/5607404f-fb91-4e9f-9522-9e3363f404a6-mahmoud-benazzouk-dentiste-.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/0e52873d-26ac-4716-9654-3c4257b613d1/70971_portrait-benjamin-dhardemare.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/a10aac1b-9c2c-4a9e-a49f-657627fd9096/TrollFace.jpg'
  ]

  FEMALE_AVATAR_URLS = [
    'http://res.cloudinary.com/citizenlabco/image/upload/v1515573998/smiling-woman_kdsaal.jpg',
    'http://res.cloudinary.com/citizenlabco/image/upload/v1515574018/tiamorrison-profile-photo-2-copy_pcnsxm.png',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/1ded0d3c-a50f-4b68-b7ff-f1ca23dc185a/Portrait-8.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/c6896f8d-2128-403a-82f0-fa04647173c6/popin_2016.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/ffdc4756-2a6e-4f3d-b147-b259ea519e4c/89c81ca5da657d45d323eff5b8ad7c69.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/9327615c-0dcd-4b72-bc1d-d7d821bbcf89/5dcf2c739263eb1e32ca1ef35d2664a8.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/851a2bdb-ef19-4d9a-a56b-75256cf855eb/BethanyR.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/4c7ab5ab-fc25-470a-81fa-c1c984759c3a/83857__portrait-tips2.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/7550ac4f-fc07-4898-9e31-7e6ecb925d87/6c44f9503011a7dd186449bd25f49f4b--painting-portraits-portrait-art.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/d1100534-2d07-41c8-b68c-f6b005e96ba8/leia-princess-leia-organa-solo-skywalker-9301321-576-1010.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/496fe56e-0f4f-4596-b0fe-f7d6709b481e/4164298-miranda-kerr-4.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/2de4f773-4f92-4aa6-a4ae-92f690bf111c/20170601183357-5506a2c2-cu_e355.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/dfbd3eac-84eb-424f-8589-64f87b1c98a0/c644c101aad7a5b28f74526a50a2d7c1--rankin-photography-light-photography.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/43b629dc-762d-4c28-9478-4a6145c7a0c1/simoneveil1.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/6a2c3645-929f-45c0-aab5-02b196c18b56/1_JvrUroQL_0QkqBqlY7Wb0A.jpeg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/9eb7a4fa-b750-4d84-a10f-0a29f7b8cd59/juror-ford.jpg',
    'https://cl2-tenant-template-content.s3.amazonaws.com/fr2_tenant_template/user/avatar/1b9903c9-5bda-47ff-b085-e4f33a6dacb5/portrait-camera-mode-e.jpg'
  ]


  def anonymized_attributes locales, user: nil, start_at: nil
    locale = locales.shuffle.first
    custom_field_values = random_custom_field_values user: user
    gender = custom_field_values['gender']
    first_name = random_first_name gender
    last_name = random_last_name locale
    email = random_email first_name, last_name
    avatar_url = random_avatar_url gender
    bio = random_bio locales
    registration = if start_at.present?
      random_registration user: user, start_at: start_at
    else
      random_registration user: user
    end
    verified = random_verified
    {
      'first_name'                => first_name,
      'last_name'                 => last_name,
      'email'                     => email,
      'password'                  => SecureRandom.urlsafe_base64(32),
      'locale'                    => locale,
      'custom_field_values'       => custom_field_values.to_json,
      'remote_avatar_url'         => avatar_url,
      'bio_multiloc'              => bio,
      'registration_completed_at' => registration,
      'created_at'                => registration,
      'verified'                  => verified,
    }
  end


  private

  def random_custom_field_values user: nil
    custom_field_values = {}
    if user
      user[:custom_field_values].each do |property, value|
        if ['gender', 'education', 'birthyear'].include? property
          custom_field_values[property] = value
        end
      end
    end
    custom_field_values['gender'] ||= User::GENDERS.shuffle.first
    custom_field_values['birthyear'] ||= random_birthyear
    custom_field_values['education'] ||= (rand(7)+2).to_s
    custom_field_values
  end

  def random_birthyear
    min_age, max_age = pick_weighted ({
      [14,20]  => 7,
      [20,30]  => 22,
      [30,40]  => 32,
      [40,50]  => 25,
      [50,60]  => 15,
      [60,70]  => 10,
      [70,80]  => 5,
      [80,90]  => 3,
      [90,100] => 1,
    })
    age = rand(max_age - min_age) + min_age
    Date.today.year - age
  end

  def pick_weighted weighted
    sum = weighted.inject(0) do |sum, item_and_weight|
      sum += item_and_weight[1]
    end
    target = rand(sum)
    weighted.each do |item, weight|
      return item if target <= weight
      target -= weight
    end
  end

  def random_first_name gender
    case gender
    when 'male'
      Faker::Name.male_first_name
    when 'female'
      Faker::Name.female_first_name
    else
      Faker::Name.first_name
    end
  end

  def random_last_name locale
    Faker::Name.last_name
  end

  def random_email first_name, last_name
    Faker::Internet.unique.email
  end

  def random_avatar_url gender
    case gender
    when 'male'
      MALE_AVATAR_URLS
    when 'female'
      FEMALE_AVATAR_URLS
    else
      MALE_AVATAR_URLS + FEMALE_AVATAR_URLS
    end.shuffle.first
  end

  def random_bio locales
    locales.map do |locale|
      bio = case %w(greek hipster movie rick_and_morty game_of_thrones nil).shuffle.first
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
    end.to_h
  end

  def random_registration user: nil, start_at: (Time.now - 1.month)
    if user
      user[:registration_completed_at]
    else
      Faker::Date.between(from: start_at, to: Time.now)
    end
  end

  def random_verified
    pick_weighted({
      false => 3,
      true => 1
    })
  end

end