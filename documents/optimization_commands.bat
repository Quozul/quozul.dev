cd ../public
purgecss --css bootstrap/bootstrap.min.css ../styles/main.css --content index.html scripts/main.js public/scripts/stars.js --output styles/index/

cd ../scripts

google-closure-compiler -O ADVANCED --language_out ECMASCRIPT_2020 --warning_level VERBOSE --js main.js utils.js stars.js --js_output_file index.min.js
