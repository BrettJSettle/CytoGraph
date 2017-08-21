set -e
npm install
npm run build
git checkout build
cp -r build/* .
rm -rf build
