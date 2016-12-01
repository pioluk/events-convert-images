.PHONY: clean

OUT_FILE=convert-images-lambda.zip
LAMBDA_NAME=convert-images

all: zip upload

zip:
	rm -rf build
	mkdir build
	cp *.js build/
	cp -r node_modules build/
	cd build && zip -rq $(OUT_FILE) .
	mv build/$(OUT_FILE) ./

upload:
	aws lambda update-function-code \
    --region eu-central-1 \
    --function-name $(LAMBDA_NAME) \
    --zip-file fileb://$(OUT_FILE)

clean:
	rm $(OUT_FILE)
	rm -rf build
