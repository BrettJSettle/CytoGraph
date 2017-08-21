git checkout build
rm -rf `ls --ignore=node_modules`
git checkout master
npm install
git checkout build
mv build/* .
rmdir build
