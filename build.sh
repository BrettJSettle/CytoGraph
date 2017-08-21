git checkout build
rm -rf *
git checkout master
npm install
git checkout build
mv build/* .
rmdir build
