'use strict';

angular.module('myApp.webRTC', ['ngRoute'])

    .controller('WebRTCCtrl', function ($scope, $rootScope, $location, User, Job, $http, API, Socket) {
        var vars = window.location.href.substring(window.location.origin.length + 1);
        $scope.AbsentEmployees = {};
        var abEmployees = $scope.AbsentEmployees;
        abEmployees.dataLoaded = false;
        $scope.open = false;
        $scope.value = 75;
        $scope.min = 1;
        $scope.max = 100;
        $scope.timer = [];
        $scope.timeout_question = []
        $scope.question = [];
        $scope.all_time;
        $scope.startInterview = false;
        $scope.questions_interview = [];
        $scope.time_interview;

        $scope.questions_interview_with_status = [];

        var userUrl = decodeURI(vars).split("/").pop();
        var infoUrl = decodeURI(vars).split("/")[1];
        Job.checkUrl(userUrl);
        Job.getCandidateInterview(userUrl)
        $rootScope.$on('candidate_user_for_interview', function (e, data) {
            $rootScope.candidate_user_for_interview = data
            $scope.candidate_user_for_interview = data
            $scope.one_candidate_user_for_interview = data.candidate

        })

        $rootScope.$on("interview_active", function (e, data) {
            $scope.questions_interview = data.questions;
            $scope.time_interview = data.timer;
            data.questions.forEach(function (item, i, arr) {
                $scope.timer.push(item.time);
                if (i === arr.length - 1) {
                    $scope.all_time = $scope.timer.reduce(function (sum, current) {
                        return sum + current;
                    }, 0);
                    abEmployees.dataLoaded = true;
                }
            });
        });
        if ($scope.questions_interview.length > 0) {
            $scope.startInterview = true;
        }

        $scope.openInfo = function () {
            if ($scope.open === false) {
                $scope.open = true
            }
            else {
                $scope.open = false;
            }
        }
        navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia || navigator.oGetUserMedia);


        /**
         * Создание AudioContext
         */
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var context = new AudioContext();

        var mediaSource = new MediaSource();
        mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
        var mediaRecorder;
        var recordedBlobs;
        var sourceBuffer;

        var gumVideo = document.querySelector('video#gum');
        var recordedVideo = document.querySelector('video#recorded');

        var recordButton = document.querySelector('button#record');
        recordButton.onclick = toggleRecording;
        var isSecureOrigin = location.protocol === 'https:' ||
            location.hostname === 'localhost';
        if (!isSecureOrigin) {
            alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
                '\n\nChanging protocol to HTTPS');
            location.protocol = 'HTTPS';
        }

        var constraints = {
            audio: true,
            video: true
        };

        function handleSuccess(stream) {
            recordButton.disabled = false;
            window.stream = stream;
            if (window.URL) {
                // gumVideo.src = elem.srcObject = stream;
                gumVideo.src = window.URL.createObjectURL(stream);
            } else {
                gumVideo.src = stream;
            }
        }

        function handleError(error) {
            console.log('navigator.getUserMedia error: ', error);
        }

        navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);


        function handleSourceOpen(event) {
            sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        }

        function handleDataAvailable(event) {
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        }

        function handleStop(event) {
            console.log('Recorder stopped: ', event);
        }

        function toggleRecording() {
            if (recordButton.textContent === 'Start Recording') {
                startRecording();
            } else {
                stopRecording();
                recordButton.textContent = 'Start Recording';
            }
        }

        var timerId;
        var question_timer;
        var count = 0;

        var first = true

        function startRecording() {
            var vars = window.location.href.substring(window.location.origin.length + 1);
            var userUrl = decodeURI(vars).split("/").pop();
            if (first == true) {
                first = false;
                var send_post = "key=" + $scope.candidate_user_for_interview.jobUser.position + "&number=" + $scope.questions_interview[0].number + '&interviewKey=' + userUrl;
                var request = new XMLHttpRequest();
                request.open("POST", API + "/job/speakquestion", true);
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.responseType = "arraybuffer";

                request.onload = function () {
                    var Data = request.response;
                    process(Data);
                };

                request.send(send_post);
                function process(Data) {
                    var source = context.createBufferSource(); // Create Sound Source
                    context.decodeAudioData(Data, function (buffer) {
                        source.buffer = buffer;
                        source.connect(context.destination);
                        source.start(context.currentTime);
                    })
                }
            }

            $scope.question.push({
                'number': $scope.questions_interview[0].number,
                'title': $scope.questions_interview[0].title
            });


            $scope.questions_interview.forEach(function (one_question, i, all_questions) {
                if (i == 0) {
                    $scope.questions_interview_with_status.push({
                        'number': $scope.questions_interview[0].number,
                        'title': $scope.questions_interview[0].title
                    })
                }
                else if (i == 1) {
                    $scope.questions_interview_with_status.push({
                        'number': i + 1,
                        'title': "Next"
                    })
                }
                else {
                    $scope.questions_interview_with_status.push({
                        'number': i + 1,
                        'title': "Pending"
                    })
                }

            })

            $scope.$digest()
            recordedBlobs = [];
            var options = {mimeType: 'video/webm;codecs=vp9'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = {mimeType: 'video/webm;codecs=vp8'};
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options = {mimeType: 'video/webm'};
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        options = {mimeType: ''};
                    }
                }
            }
            try {
                mediaRecorder = new MediaRecorder(window.stream, options);
            } catch (e) {
                console.error('Exception while creating MediaRecorder: ' + e);
                alert('Exception while creating MediaRecorder: '
                    + e + '. mimeType: ' + options.mimeType);
                return;
            }
            recordButton.textContent = 'Stop Recording';
            mediaRecorder.onstop = handleStop;
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.start(10); // collect 10ms of data;
            //сохданение видео каждый интервал времени
            timerId = setInterval(function () {
                var userStream = mediaRecorder.requestData();

                var blob = new Blob(recordedBlobs, {type: 'video/webm'});
                var url = window.URL.createObjectURL(blob);

                var xhr = new XMLHttpRequest;
                xhr.responseType = 'blob';

                xhr.onload = function () {
                    var recoveredBlob = xhr.response;

                    var reader = new FileReader;

                    reader.onload = function () {
                        var blobAsDataUrl = reader.result;

                        var data = {
                            contents: blobAsDataUrl,
                            name: userUrl + '.webm',
                            type: 'video/webm'
                        }
                        $http({
                            method: "post",
                            url: API + "/stream/save_timer",
                            data: data
                        }).then(function (user) {
                        })

                    };

                    reader.readAsDataURL(recoveredBlob);
                };

                xhr.open('GET', url);
                xhr.send();

            }, 6000)


            /**
             *Динамическое формирование таймеров
             */
            $scope.timer.forEach(function (item, i, arr) {
                var sum = 0;
                for (var j = 0; j < i + 1; j++) {
                    sum += $scope.timer[j];
                }
                $scope.timeout_question.push(sum);
                if(i == arr.length - 1){
                }
            });
            $scope.timeout_question.forEach(function (item, i, arr) {
                setTimeout(function () {
                        $scope.question.push({
                            'number': $scope.questions_interview[i + 1].number,
                            'title': $scope.questions_interview[i + 1].title
                        });
                        $scope.$digest()
                        $scope.questions_interview_with_status = [];

                        $scope.questions_interview.forEach(function (one_question, j, all_questions) {
                            if (j < i + 1) {
                                $scope.questions_interview_with_status.push({
                                    'number': j + 1,
                                    'title': "Answered"
                                })
                            }
                            else if (j == i + 1) {
                                $scope.questions_interview_with_status.push({
                                    'number': $scope.questions_interview[i + 1].number,
                                    'title': $scope.questions_interview[i + 1].title
                                })
                            }
                            else if (j == i + 2) {
                                $scope.questions_interview_with_status.push({
                                    'number': j + 1,
                                    'title': "Next"
                                })
                            }
                            else {
                                $scope.questions_interview_with_status.push({
                                    'number': j + 1,
                                    'title': "Pending"
                                })
                            }

                        })
                        /**
                         * Озвучка вопроса
                         */
                        var send_post = "key=" + $scope.candidate_user_for_interview.jobUser.position + "&number=" + $scope.questions_interview[i + 1].number + '&interviewKey=' + userUrl;
                        ;

                        var request = new XMLHttpRequest();
                        request.open("POST", API + "/job/speakquestion", true);
                        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        request.responseType = "arraybuffer";

                        request.onload = function () {
                            var Data = request.response;
                            process(Data);
                        };

                        request.send(send_post);
                        function process(Data) {
                            var source = context.createBufferSource(); // Create Sound Source
                            context.decodeAudioData(Data, function (buffer) {
                                source.buffer = buffer;
                                source.connect(context.destination);
                                source.start(context.currentTime);
                            })
                        }
                    },
                    item);
            });


            /**
             *Спустя время собеседования остановить поток, сjхранить видео на сервер
             */
            setTimeout(function () {
                    stopRecording();
                    abEmployees.dataLoaded = false;
                    recordButton.textContent = 'Start Recording';
                },
                $scope.time_interview)
        }

        function stopRecording() {
            mediaRecorder.stop();
            clearInterval(timerId);
            clearInterval(question_timer);
            download()
        }

        function play() {
            var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
            recordedVideo.src = window.URL.createObjectURL(superBuffer);
        }


        function download() {
            var blob = new Blob(recordedBlobs, {type: 'video/webm'});
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'test.webm';
            document.body.appendChild(a);
            var vars = window.location.href.substring(window.location.origin.length + 1);
            // var vars = window.location.hash
            var userUrl = decodeURI(vars).split("/").pop();
            var xhr = new XMLHttpRequest;
            xhr.responseType = 'blob';

            xhr.onload = function () {
                var recoveredBlob = xhr.response;

                var reader = new FileReader;

                reader.onload = function () {
                    var blobAsDataUrl = reader.result;
                    $location.path('/finish');
                    var data = {
                        contents: blobAsDataUrl,
                        name: userUrl + '.webm',
                        type: 'video/webm'
                    }
                    $http({
                        method: "post",
                        url: API + "/stream/save",
                        data: data
                    }).then(function (user) {

                    })

                };

                reader.readAsDataURL(recoveredBlob);
            };

            xhr.open('GET', url);
            xhr.send();


            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        }
    });