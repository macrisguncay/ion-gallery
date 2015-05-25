(function(){
  'use strict';
  
  angular
    .module('ion-gallery', ['templates'])
    .directive('ionGallery',ionGallery);
  
  ionGallery.$inject = ['$ionicPlatform','ionService'];
  
  function ionGallery($ionicPlatform,ionService) {
    controller.$inject = ["$scope"];
    return {
      restrict: 'AE',
      scope:{
        ionGalleryItems: '=ionGalleryItems',
        ionGalleryRow: '=ionGalleryRow',
      },
      link: link,
      controller: controller,
      replace:true,
      templateUrl:'gallery.html'
    };
    
    function controller($scope){
      
      ionService.setGalleryLength($scope.ionGalleryItems.length);
      ionService.setRowSize(parseInt($scope.ionGalleryRow));
      
      var items = $scope.ionGalleryItems,
          gallery = [],
          rowSize = ionService.getRowSize(),
          row = -1,
          col = 0;
            
      for(var i=0;i<items.length;i++){
        
        if(i % rowSize === 0){
          row++;
          gallery[row] = [];
          col = 0;
        }
        
        gallery[row][col] = items[i];
        col++;
      }
      
      $scope.items = gallery;
      $scope.responsiveGrid = parseInt((1/rowSize)* 100);
    }

    function link(scope, element, attrs) {
    }
  }
})();
(function(){
  'use strict';
  
  angular
    .module('ion-gallery')
    .service('ionService',ionService);
  
  ionService.$inject = [];
  
  function ionService() {
    
    var rowSize = 3,
        galleryLength,
        self = this;
    
    this.setGalleryLength = function(length){
      galleryLength = length;
    };
    
    this.getGalleryLength = function(){
      return galleryLength;
    };
    
    this.setRowSize = function(size){
      var length = self.getGalleryLength;
      
      if(size > length){
        rowSize = length;
      }
      else if(size <= 0){
        rowSize = 1;
      }
      else{
        rowSize = size;
      }
    };
    
    this.getRowSize = function(){
      return rowSize;
    };
    
  }
})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionSlider',ionSlider);

  ionSlider.$inject = ['$ionicModal','ionService'];

  function ionSlider($ionicModal,ionService){
    
    controller.$inject = ["$scope"];
    return {
      restrict: 'A',
      controller: controller,
      link : link
    };
    
    function controller($scope){
      var lastSlideIndex,
          currentImage,
          galleryLength = ionService.getGalleryLength(),
          rowSize = ionService.getRowSize();
          
      $scope.selectedSlide = 1;

      $scope.showImage = function(row,col) {
        $scope.slides = [];
        
        currentImage = row*rowSize + col;
        
        var index = currentImage;
        var previndex = index - 1;
        var nextindex = index + 1;

        if( previndex < 0 ){
          previndex = galleryLength - 1;
        }

        if( nextindex >= galleryLength ){
          nextindex = 0;
        }

        $scope.slides[0] = {
          'thumbnail': $scope.ionGalleryItems[previndex].src,
        };
        $scope.slides[1] = {
          'thumbnail': $scope.ionGalleryItems[index].src,
        };
        $scope.slides[2] = {
          'thumbnail': $scope.ionGalleryItems[nextindex].src,
        };
        
        console.log( 'loadSingles: ' + previndex + ' ' + index + ' ' + nextindex);

        lastSlideIndex = 1;
        $scope.loadModal();
      };

      $scope.slideChanged = function(currentSlideIndex) {
        
        if(currentSlideIndex === lastSlideIndex){
          return;
        }

        var slideToLoad,
            imageToLoad;
        
        console.log( 'loadSingles: ' + lastSlideIndex + ' > ' + currentSlideIndex);
        
        switch( lastSlideIndex + '>' + currentSlideIndex ) {
          case '0>1':
            {
              slideToLoad = 2;
              currentImage++;
              imageToLoad = currentImage + 1;
              break;
            }
          case '1>2':
            {
              slideToLoad = 0;
              currentImage++;
              imageToLoad = currentImage + 1;
              break;
            }
          case '2>0':
            {
              slideToLoad = 1;
              currentImage++;
              imageToLoad = currentImage + 1;
              break;
            }
          case '0>2':
            {
              slideToLoad = 1;
              currentImage--;
              imageToLoad = currentImage - 1;
              break;
            }
          case '1>0':
            {
              slideToLoad = 2;
              currentImage--;
              imageToLoad = currentImage - 1;
              break;
            }
          case '2>1':
            {
              slideToLoad = 0;
              currentImage--;
              imageToLoad = currentImage - 1;   
              break;
            }
        }

        if( currentImage < 0 ){
          currentImage = galleryLength - 1;
        }

        if( currentImage > galleryLength ){
          currentImage = 0;
        }

        if( imageToLoad < 0 ){
          imageToLoad = galleryLength + imageToLoad;
        }

        if( imageToLoad >= galleryLength ){
          imageToLoad = imageToLoad - galleryLength;
        }

        $scope.slides[slideToLoad] = {
          'thumbnail': $scope.ionGalleryItems[imageToLoad].src
        };
        
        lastSlideIndex = currentSlideIndex;
      };
    }

    function link(scope, element, attrs) {
      var rename;

      scope.loadModal = function(){
        $ionicModal.fromTemplateUrl('slider.html', {
          scope: scope,
          animation: 'fade-in'
        }).then(function(modal) {
          rename = modal;
          scope.openModal();
        });
      };

      scope.openModal = function() {
        rename.show();
      };

      scope.closeModal = function() {
        rename.hide();
      };

      scope.$on('$destroy', function() {
        rename.remove();
      });
    }
  }
})();
angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("gallery.html","<div>\n  <div class=\"row\" ng-repeat=\"item in items\">\n    <img \n         ng-repeat=\"photo in item track by $index\"\n         class=\"col col-{{responsiveGrid}}\"\n         ng-src=\"{{photo.src}}\"\n         ng-click=\"showImage({{$parent.$index}},{{$index}})\">\n  </div>\n  <div ion-slider></div>\n</div>");
$templateCache.put("slider.html","<ion-modal-view class=\"blackBackground imageView\">\n  <ion-header-bar class=\"headerView\">\n    <button class=\"button button-outline button-light close-btn\" ng-click=\"closeModal()\">Done</button>\n  </ion-header-bar>\n    \n  <ion-content scroll=\"false\">\n    <ion-slide-box does-continue=\"true\" active-slide=\"selectedSlide\" show-pager=\"false\" class=\"listContainer\" on-slide-changed=\"slideChanged($index)\">\n      <ion-slide ng-repeat=\"single in slides track by $index\">\n        <div class=\"item item-image centerPictureVertical gallery-slide-view\">\n          <img ng-src=\"{{single.thumbnail}}\">\n        </div>\n      </ion-slide>\n    </ion-slide-box>\n  </ion-content>\n</ion-modal-view>");}]);