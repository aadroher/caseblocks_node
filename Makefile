.PHONY: test
test:
		DEBUG=nock.* ./node_modules/.bin/mocha --reporter spec


