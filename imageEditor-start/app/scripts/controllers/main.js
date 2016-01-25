'use strict';

angular.module('imageEditorApp')
    .controller('MainCtrl', function ($scope) {

        $scope.setImageFile = function (element) {
            //get the image file from element 
            //start to put the data into canvas element
            //fileReader    
            //onload 
            console.log(element); // <input type="file" onchange="angular.element(this).scope().setImageFile(this)">
            var reader = new FileReader();
            reader.onload = function (e) {
                //set image src
                $scope.image.src = e.target.result;
                console.log(e.target); //FileReader{}
                console.log(e.target.result); //image link
            };

            reader.readAsDataURL(element.files[0]);
            console.log(element);
            console.log(element.files[0]); // File{}
            $scope.image.onload = $scope.resetImage;
        };


        $scope.init = function () {
            //initialize default values for variables
            $scope.brightness = 0;
            $scope.contrast = 1;
            $scope.strength = 1;
            $scope.color = {
                red: 255,
                green: 189,
                blue: 0
            };
            $scope.autocontrast = false;
            $scope.vignette = false;
            $scope.canvas = angular.element('#myCanvas')[0];
            $scope.ctx = $scope.canvas.getContext('2d'); // get 2d context of canvas;
            $scope.image = new Image();

            $scope.vignImage = new Image();
            //$scope.vignImage.onload = resetVign;

        };

        $scope.init();

        $scope.resetImage = function () {
            //when image data is loaded,(after onload)
            //put the data into canvas element

            // when image data is loaded, (after onload)
            // set size of canvas to match image size
            $scope.canvas.height = $scope.image.height;
            $scope.canvas.width = $scope.image.width;

            $scope.ctx.drawImage($scope.image, 0, 0, $scope.canvas.width, $scope.canvas.height);
            // read pixel data
            $scope.imageData = $scope.ctx.getImageData(0, 0, $scope.canvas.width, $scope.canvas.height);
            $scope.pixels = $scope.imageData.data;
            $scope.numPixels = $scope.imageData.width * $scope.imageData.height;

            //load vignette image
            if ($scope.vignImage.src === '') {
                $scope.vignImage.onload = resetVign;
                $scope.vignImage.src = 'images/vignette.jpg';
            }
        };

        // Generic method for resetting image, applying filters and updating canvas
        $scope.applyFilters = function () {
            $scope.resetImage();

            adjustBrightness();
            adjustContrast();
            tint();

            if ($scope.vignette) {
                setVignette();
            }

            //saveImage();

            $scope.ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
            $scope.ctx.putImageData($scope.imageData, 0, 0);
        };

        var adjustBrightness = function () {
            //$scope.resetImage();
            //$scope.imageData = $scope.ctx.getImageData(0, 0, $scope.canvas.width, $scope.canvas.height);
            //$scope.pixels = $scope.imageData.data;
            //$scope.numPixels = $scope.imageData.width * $scope.imageData.height;

            var brightInt = parseInt($scope.brightness);
            for (var i = 0; i < $scope.numPixels; i++) {
                $scope.pixels[i * 4] += brightInt;
                $scope.pixels[i * 4 + 1] += brightInt;
                $scope.pixels[i * 4 + 2] += brightInt;
            }
            //$scope.ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
            //$scope.ctx.putImageData($scope.imageData, 0, 0);
        };

        var adjustContrast = function () {
            // type of input field value is string and must be parsed to float to make
            // numeric calculations instead of string concatenation
            var contrastFloat = parseFloat($scope.contrast);
            // iterate through pixel array and modify rgb values of each pixel one by one 
            for (var i = 0; i < $scope.numPixels; i++) {
                $scope.pixels[i * 4] = ($scope.pixels[i * 4] - 128) * contrastFloat + 128; // Red
                $scope.pixels[i * 4 + 1] = ($scope.pixels[i * 4 + 1] - 128) * contrastFloat + 128; // Green
                $scope.pixels[i * 4 + 2] = ($scope.pixels[i * 4 + 2] - 128) * contrastFloat + 128; // Blue

            }
        };


        var tint = function () {
            var strengthInt = parseInt($scope.strength);
            for (var i = 0; i < $scope.numPixels; i++) {
                $scope.pixels[i * 4] = $scope.pixels[i * 4] + $scope.color.red * strengthInt / 100; //Red
                $scope.pixels[i * 4 + 1] = $scope.pixels[i * 4 + 1] + $scope.color.green * strengthInt / 100; //Green
                $scope.pixels[i * 4 + 2] = $scope.pixels[i * 4 + 2] + $scope.color.blue * strengthInt / 100; //Blue
            }
        };

        var resetVign = function () {
            var cn = document.createElement('canvas');
            //make cn the same width and height as the main image
            cn.width = $scope.image.width;
            cn.height = $scope.image.height;

            //get the context of cn
            var ctx = cn.getContext('2d');

            //draw the vignette image to ctx
            ctx.drawImage($scope.vignImage, 0, 0, $scope.vignImage.width, $scope.vignImage.height, 0, 0, cn.width, cn.height);

            $scope.vignData = ctx.getImageData(0, 0, cn.width, cn.height); // get the imageData of the vignette
            $scope.vignPixels = $scope.vignData.data; // get the pixels from imageData

        };

        var setVignette = function () {
            console.log($scope.vignData.data);

            //Po = Pi * Pv /255;
            for (var i = 0; i < $scope.numPixels; i++) {
                $scope.pixels[i * 4] = $scope.pixels[i * 4] * $scope.vignPixels[i * 4] / 255; //Red
                $scope.pixels[i * 4 + 1] = $scope.pixels[i * 4 + 1] * $scope.vignPixels[i * 4 + 1] / 255; //Green
                $scope.pixels[i * 4 + 2] = $scope.pixels[i * 4 + 2] * $scope.vignPixels[i * 4 + 2] / 255; //Blue
            }
        };

        $scope.saveImage = function () {
            var imgAsDataUrl = $scope.canvas.toDataURL('image/png');
            $scope.url = imgAsDataUrl;
        };
    })
    .config(function ($compileProvider) {

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|coui|data):/);
        //whitelists non-http: protocols. specifically we need coui for coherent.
    });