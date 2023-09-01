# frozen_string_literal: true

require 'csv'

namespace :id_clave_unica do
  # Run these commands locally (not to install poppler-utils on production)
  #
  # docker cp ../clave-unica/Padron-13-LA\ REINA-1-2\ \(1\).pdf "$(docker ps | awk '/citizenlab-web/ {print $1}')":/cl2_back/ruts.pdf
  # docker cp ../clave-unica/Padron-13-LA\ REINA-2-2\ \(1\).pdf "$(docker ps | awk '/citizenlab-web/ {print $1}')":/cl2_back/ruts2.pdf
  #
  # docker exec -it "$(docker ps | awk '/citizenlab-web/ {print $1}')" bin/rails 'id_clave_unica:parse_rut_pdf_to_csv[ruts.csv,ruts.pdf,ruts2.pdf]'
  #
  # docker cp "$(docker ps | awk '/citizenlab-web/ {print $1}')":/cl2_back/ruts.csv ./ruts.csv
  #
  task :parse_rut_pdf_to_csv, %i[output_csv_file_path] => [:environment] do |_t, args|
    `apt-get install -qq -y --no-install-recommends poppler-utils`
    # https://stackoverflow.com/questions/46770938/regex-for-chilean-rut-run-with-pcre
    rut_format_regex = /\d{1,3}(?:\.\d{1,3}){2}-[\dkK]/

    ruts = []
    args.extras.each do |input_pdf_file_path|
      puts "Reading #{input_pdf_file_path}"
      tmp_file_path = Tempfile.new.path
      `pdftotext -layout "#{input_pdf_file_path}" "#{tmp_file_path}"`
      new_ruts = File.read(tmp_file_path).scan(rut_format_regex)
      # plain_new_ruts = new_ruts.map { |rut| rut.split('-').first.delete('.') }
      ruts += new_ruts
    end
    File.write(args[:output_csv_file_path], ruts.join("\n"))
  end

  task :update_rut_verified_flag, %i[input_csv_file_path] => [:environment] do |_t, args|
    File.read(args[:input_csv_file_path]).split("\n").each do |rut|
      hashed_uid = Verification::VerificationService.new.send(:hashed_uid, rut, 'clave_unica')
      verification = Verification::Verification.find_by(method_name: 'clave_unica', hashed_uid: hashed_uid)
      if verification.nil?
        print '.'
      else
        user = verification.user
        if user
          user.update_merging_custom_fields!(custom_field_values: { rut_verified: true })
          puts "Updated user #{user.id} (#{rut})"
        end
      end
    end
  end
end
