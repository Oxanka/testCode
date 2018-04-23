'use strict';

angular.module('myApp.classcreatortrainer', ['ngRoute'])

    .controller('ClassCreatorTrainerCtrl', function ($scope, $rootScope, $location, User, API, Media, usertoken, userinfo, msg) {
        if (window.localStorage.login_user) {
            $scope.email = JSON.parse(window.localStorage.login_user).email;
            userinfo.userinfo = JSON.parse(window.localStorage.login_user);
            usertoken.user_tocken = JSON.parse(window.localStorage.login_user_token);
            User.getLoginUserInfo($scope.email);
            $rootScope.$on("get_info", function (e, data) {
                $scope.user = userinfo.userinfo;
                Media.getAllTrait();
            });
        }
        else {
            $location.path('/login');
        }

        $(document).ready(function () {
            $(document).on('click', '.notification__close', function () {
                $('.notification--error').remove();
                $('.notification--success').remove();
            });
        });

        $scope.appUrl = API;
        $scope.list = [];
        $scope.list1 = [];
        $scope.traits = [];
        $scope.searchInfo = null;
        $scope.infoForSearchTraits = [];


        $scope.search = function (searchN) {
                if (searchN === '' || searchN === null) {
                    $scope.traits = $scope.infoForSearchTraits.slice();
                }
                else {
                    var searchArray = [];
                    for (var i = 0; i < $scope.infoForSearchTraits.length; i++) {

                        var basicName = $scope.infoForSearchTraits[i].name.toLowerCase(),
                            searchName = searchN.toLowerCase();

                        if (basicName.indexOf(searchName) != -1) {
                            searchArray.push($scope.infoForSearchTraits[i]);
                        }
                    }
                    $scope.traits = searchArray;
                }           
        }

        $rootScope.$on("allTraits", function (e, data) {
            if (data.length > 0) {
                data.forEach(function (item, i, arr) {
                    var arrayFileInfo = item.filename.split('.');
                    data[i].type = arrayFileInfo[arrayFileInfo.length - 1];
                    data[i].typeMedia = 'Traits';
                    if (i === arr.length - 1) {
                        $scope.traits = data;
                        $scope.infoForSearchTraits = data;
                    }
                });
            }
            else {
                $scope.traits = [];
            }
        });

        $scope.selectTraits = function () {
            $scope.typeLesson = 'traits';
            $scope.traits = $scope.infoForSearchTraits.slice();
            $scope.searchInfo = null;
        };

        $scope.droppedObjectsTraits = [];
        $scope.droppedObjectsUnformatted = [];
        $scope.className = null;
        $scope.typeCreator = 'formatted';
        $scope.setDuration = false;

        $scope.selectFormatted = function () {
            $scope.typeCreator = 'formatted';
        };
        $scope.selectUnformatted = function () {
            $scope.typeCreator = 'unformatted';
        };

        $scope.updateDuration = function () {
            $scope.setDuration = true;
        }
        $scope.createClass = function () {
            if ($scope.typeCreator == 'formatted') {
                var traits = [];
                if ($scope.droppedObjectsTraits.length > 0) {
                    for (var i = 0; i < $scope.droppedObjectsTraits.length; i++) {
                        traits.push($scope.droppedObjectsTraits[i]._id)
                    }
                }
                var lesson = {
                    name: document.getElementsByClassName('class-creator__class-name')[0].innerText,
                    drills: drills,
                    curriculum: curriculum,
                    traits: traits
                };
            }
            if ($scope.typeCreator == 'unformatted') {
                var traits = [];
                if ($scope.droppedObjectsUnformatted.length > 0) {
                    for (var i = 0; i < $scope.droppedObjectsUnformatted.length; i++) {
                        if ($scope.droppedObjectsUnformatted[i].typeMedia == 'Traits') {
                            traits.push($scope.droppedObjectsUnformatted[i]._id)
                        }                        
                    }
                }
                var lesson = {
                    name: document.getElementsByClassName('class-creator__class-name')[0].innerText,
                    drills: drills,
                    curriculum: curriculum,
                    traits: traits
                };
            }
            Media.addClass(lesson);
        };

        $scope.onDragComplete = function (data, evt) {
            if ($scope.typeCreator == 'formatted') {
                if ($scope.typeLesson == 'traits') {
                    var index = $scope.droppedObjectsTraits.indexOf(data);
                }
            }
            else if ($scope.typeCreator == 'unformatted') {
                var index = $scope.droppedObjectsUnformatted.indexOf(data);
            }

            if (index > -1) {
                if ($scope.typeCreator == 'formatted') {
                    if ($scope.typeLesson == 'traits') {
                        $scope.droppedObjectsTraits.splice(index, 1);
                    }
                }
                else if ($scope.typeCreator == 'unformatted') {
                    var index = $scope.droppedObjectsUnformatted.splice(index, 1);
                }

            }
        }

        $scope.onDropComplete = function (data, evt) {
            $('.page__sidebar').removeClass('page__sidebar--is-dragging');
            if ($scope.typeCreator == 'formatted') {
                if ($scope.typeLesson == 'traits') {
                    var index = $scope.droppedObjectsTraits.indexOf(data);
                }
            }
            else if ($scope.typeCreator == 'unformatted') {
                var index = $scope.droppedObjectsUnformatted.indexOf(data);
            }
            if (index == -1) {
                if ($scope.typeCreator == 'formatted') {
                    if ($scope.typeLesson == 'traits') {
                        $scope.droppedObjectsTraits.push(data);
                    }
                }
                else if ($scope.typeCreator == 'unformatted') {
                    var index = $scope.droppedObjectsUnformatted.push(data);
                }
            }

        };

        $scope.onDropCompleteInput = function (data, evt) {
            $scope.input = data;
        };

        $scope.onDropCompleteRemove = function (data, evt) {
            $('.page__sidebar').removeClass('page__sidebar--is-dragging');
            if ($scope.typeCreator == 'formatted') {
                if ($scope.typeLesson == 'traits') {
                    var index = $scope.droppedObjectsTraits.indexOf(data);
                }
            }
            else if ($scope.typeCreator == 'unformatted') {
                var index = $scope.droppedObjectsUnformatted.indexOf(data);
            }
            if (index != -1) {
                if ($scope.typeCreator == 'formatted') {
                    if ($scope.typeLesson == 'traits') {
                        $scope.droppedObjectsTraits.splice(index);
                    }
                }
                else if ($scope.typeCreator == 'unformatted') {
                    var index = $scope.droppedObjectsUnformatted.splice(index);
                }
            }
        };

        $scope.deleteElement = function (type, id) {
            if(type === 'traits'){
                $scope.droppedObjectsTraits = _.without($scope.droppedObjectsTraits, _.findWhere( $scope.droppedObjectsTraits, {
                    _id: id
                }));
            }            
            else if(type === 'all'){
                $scope.droppedObjectsUnformatted = _.without($scope.droppedObjectsUnformatted, _.findWhere($scope.droppedObjectsUnformatted, {
                    _id: id
                }));
            }
        };
        var onDraggableEvent = function (evt, data) {
            $('.page__sidebar').addClass('page__sidebar--is-dragging')
        };
        $scope.$on('draggable:start', onDraggableEvent);
        $scope.$on('draggable:end', onDraggableEvent);

        $scope.showDroped = function () {
            console.log(document.getElementsByClassName('class-creator__class-name')[0].innerText);
        };

        $rootScope.$on('classCreated', function (e, data) {
            msg.showSuccess();
        })
        /**
         * Выход из системы
         */
        $scope.logOut = function () {
            window.localStorage.clear();
            $location.path('/login');
        };
    });