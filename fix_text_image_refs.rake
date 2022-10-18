# frozen_string_literal: true

namespace :fix do
  desc 'Replace specific bad text_image ref with good, in About page top_info_section_multiloc'
  task fix_text_image_refs: [:environment] do |_t, _args|
    bad_ref = 'e2c7bc7a-017đ4887-a3cb-b94185617a59'
    good_ref = 'e2c7bc7a-017d-4887-a3cb-b94185617a59'

    n_fix_needed = 0
    n_fix_succeeded = 0

    Tenant.all.each_with_index do |tenant, i|
      puts "#{i + 1}). Processing tenant #{tenant.host}..."

      Apartment::Tenant.switch(tenant.schema_name) do
        page = StaticPage.find_by(slug: 'information')

        unless page.nil?
          text_image = TextImage.find_by(
            text_reference: good_ref,
            imageable_id: page.id,
            imageable_type: 'StaticPage'
          )

          if check_refs?(page.top_info_section_multiloc, bad_ref)
            n_fix_needed +=1
            if text_image.nil?
              puts '❌ could not fix,as NO good associated TextImage exists'
            else
              page.top_info_section_multiloc.each do |k, v|
                if v.include?(bad_ref)
                  page.top_info_section_multiloc[k] = v.gsub(bad_ref, good_ref)
                end
              end

              begin
                if page.save!
                  n_fix_succeeded += 1
                  puts '✅ fix applied'
                else
                  puts '❌ could not save fixed static_page'
                end
              rescue StandardError => e
                puts "❌ Something went wrong! Error: #{e}."
              end
            end
          end
        end
      end      
    end
    
    puts "#{n_fix_needed} tenants required fixing"
    puts "#{n_fix_succeeded} tenants successfully fixed"
  end
end

def check_refs?(multiloc, ref)
  multiloc.each do |_k, v|
    return true if v.include?(ref)
  end

  false
end
