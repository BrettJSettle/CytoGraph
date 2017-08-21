set -e
git checkout build
rm -rf `ls --ignore=node_modules`
git checkout master
npm install
npm run build
git checkout build
mv build/* .
rmdir build
