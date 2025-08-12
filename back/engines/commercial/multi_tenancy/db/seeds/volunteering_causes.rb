# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class VolunteeringCauses < Base
      def run
        volunteering_project = Project.create!(
          title_multiloc: {
            en: 'Help out as a volunteer',
            'nl-BE': 'Help mee als vrijwilliger',
            'fr-BE': 'Aider en tant que bénévole'
          },
          description_multiloc: runner.rand_description_multiloc,
          description_preview_multiloc: {
            'en' => 'Every bit of help counts',
            'nl-BE' => 'Alle beetjes helpen',
            'fr-BE' => 'Chaque petit geste compte'
          },
          header_bg: rand(25) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open,
          areas: Array.new(rand(3)) { rand(Area.count) }.uniq.map { |offset| Area.offset(offset).first },
          admin_publication_attributes: {
            publication_status: 'published'
          }
        )

        ProjectImage.create({ project: volunteering_project,
                              image: Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open })

        phase_start_at = 1.day.ago
        volunteering_phase = Phase.create!({
          project: volunteering_project,
          title_multiloc: volunteering_project.title_multiloc,
          description_multiloc: volunteering_project.description_multiloc,
          start_at: phase_start_at,
          end_at: (phase_start_at + rand(150).days),
          participation_method: 'volunteering'
        })

        Volunteering::Cause.create!([
          {
            phase: volunteering_phase,
            title_multiloc: { en: 'Video calls' },
            description_multiloc: {
              'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
              'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
            },
            image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open
          },
          {
            phase: volunteering_phase,
            title_multiloc: { en: 'Doing groceries' },
            description_multiloc: {
              'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
              'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
            },
            image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open
          },
          {
            phase: volunteering_phase,
            title_multiloc: { en: 'Going to the post office' },
            description_multiloc: { en: <<~DESC
              <p>Many people should stay inside. They are at home and cannot go to the post office to post a letter or to pick up a parcel. Can you help them?</p>
              <h4>Necessary material</h4>
              <ul>
                <li>sport to go to the post office.</li>
              </ul>
              <p>We provide you with the contact details of this person. Arrange by phone or mail what you have to post or pick up. Don’t go inside the house of this person but pick up the mail or drop it at the door.</p>
              <p>Always observe the hygienic precautions.</p>
              <h4>Profile of the volunteer</h4>
              <ul>
                <li>You’re between 16 and 60 years old.</li>
                <li>You’re healthy and show no symptoms.</li>
                <li>You haven’t been in a risk area recently.</li>
                <li>You’ve had no contact with people who have been in a risk area recently.</li>
              </ul>'
            DESC
 },
            image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open
          },
          {
            phase: volunteering_phase,
            title_multiloc: { en: 'Walking the dog' },
            description_multiloc: {
              'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
              'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
            },
            image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open
          },
          {
            phase: volunteering_phase,
            title_multiloc: { en: 'Writing letters' },
            description_multiloc: {
              'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
              'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
            },
            image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open
          }
        ])
      end
    end
  end
end
