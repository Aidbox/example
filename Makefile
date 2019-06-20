deps: npm i -g npm
aidbox-app:
	docker-compose -f dev/docker-compose-test.yml up -d
	cd app && npm ci && HOST_IP=127.0.0.1 npm test
	docker-compose -f dev/docker-compose-test.yml down
aidbox-app-ci:
	docker-compose -f dev/docker-compose-test.yml up -d
	cd app && npm ci && HOST_IP=127.0.0.1 npm test && npm run test:codecov
	docker-compose -f dev/docker-compose-test.yml down
mobile-app:
	cd mobile && npm install && npm test
