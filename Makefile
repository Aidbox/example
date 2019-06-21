deps:
	npm i -g npm
test:
	exit 0
aidbox-app:
	docker-compose -f dev/docker-compose-test.yml --project-name at up -d
	cd app && npm install
	docker build -t app_test -f app/Dockerfile-test ./app
	cd app && npm run test:docker
mobile-app:
	cd mobile && npm install && npm test
