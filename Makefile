MOCHA=./node_modules/mocha/bin/mocha
FLAGS=--reporter spec
test:
	$(MOCHA) $(FLAGS) ./test/*.test.js

.PHONY: test
