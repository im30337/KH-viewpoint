$(document).ready(function () {
    //到網頁底部的按鈕事件
    $('.middleline-box').on('click', '.middleline-btn', function () {
        // 1. 取得移動的目標
        //    $('選擇目標').attr('屬性名稱') 取得屬性的值
        var target = $(this).attr('href');
        // 2. 取得目標的座標
        //    $('選擇目標').offset() 取得到目標的座標
        var position = $(target).offset().top;
        // 3. (先停止動畫再)透過動畫移動到指定的座標
        var navbarHeight = 56;
        var animateDuration = 500;
        //                .stop()停止動畫
        //    $('選擇目標').animate({}, 微秒數);
        $('html, body').stop().animate({
            scrollTop: position - navbarHeight
        }, animateDuration);
    });
    var xhr = new XMLHttpRequest();
    xhr.open("get", "https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97", true);
    //ture 非同步,不會等資料傳回來就執行下一行
    xhr.send(null);
    xhr.onload = function () {
        var viewpointData = JSON.parse(xhr.responseText);
        var viewpointDetail = viewpointData.result.records;
        var map = initialMap();
        var markers = [];
        //console.log(viewpointData);
        $(".selectlist").on("change", function () {
            clearMarkers(null, markers);
            document.querySelector(".viewpoint-content").innerHTML = "";
            document.querySelector(".page-button").innerHTML = "";
            $("h2")[0].textContent = $(this)[0].value;
            appendTemplete($(this)[0].value, map);
        });
        $(".famous-region").on("click", ".famous-region-btn", function () {
            clearMarkers(null, markers);
            document.querySelector(".viewpoint-content").innerHTML = "";
            document.querySelector(".page-button").innerHTML = "";
            $("h2")[0].textContent = $(this)[0].textContent;
            appendTemplete($(this)[0].textContent, map);
        });

        function appendTemplete(chosenValue, map) {
            var appendData = viewpointDetail.filter(function (item, index, array) {
                return item.Zone == chosenValue;
            });
            if (appendData.length == 0) {
                return 0;
            }
            console.log(appendData);
            googleMap(appendData, map, markers);
            var quotient = parseInt((appendData.length) / 6);
            var remainder = (appendData.length) % 6;
            //console.log(quotient, remainder);
            pageProducer(quotient, remainder, appendData.length, appendData);
        }

        function pageProducer(quotient, remainder, arrayLength, appendData) {
            var Totalpages = quotient;
            if (remainder != 0) {
                Totalpages += 1;
            }
            //console.log(Totalpages);
            if (Totalpages > 1) {
                appendTempleteByPage(1, 5, appendData);
                $(".page-button").append(`<span> prev </span>`);
                for (var beginPage = 1; beginPage <= Totalpages; beginPage++) {
                    endIndex = (beginPage * 6) - 1;
                    if (endIndex > (arrayLength - 1)) {
                        endIndex = arrayLength - 1;
                    }
                    $(".page-button").append(`<a href="#" class = "page${beginPage}" id="page${beginPage}">${beginPage}</a>`);
                    document.querySelector('#page' + beginPage).onclick = appendTempleteByPageCallback(beginPage, endIndex, appendData);
                }
                $(".page-button").append(`<span> next </span>`);
            } else {
                appendTempleteByPage(1, (remainder - 1), appendData);
                $(".page-button").append(
                    `
                <span> prev </span>
                <a href="#" class = "page${Totalpages}" id="page${Totalpages}">${Totalpages}</a>
                <span> next </span>
                `
                );
                // document.querySelector('#page' + Totalpages).onclick = function () {
                //     document.querySelector('.viewpoint-content').innerHTML = "";
                //     appendTempleteByPage(Totalpages, (remainder - 1), appendData);
                // };
                document.querySelector('#page' + Totalpages).onclick = appendTempleteByPageCallback(Totalpages, (remainder - 1), appendData);


            }


        }

        function appendTempleteByPageCallback(page, endIndex, appendData) {

            return function () {
                document.querySelector('.viewpoint-content').innerHTML = "";
                appendTempleteByPage(page, endIndex, appendData);
            };
        }

        function appendTempleteByPage(page, endIndex, appendData) {
            for (var index = (page - 1) * 6; index <= endIndex; index++) {
                var templete =
                    `<div class="viewpoint-block">
                            <div class = "block-background"
                            style = "background-image:url(${appendData[index].Picture1})" >
                                <span>${appendData[index].Name}</span>
                                <span>${appendData[index].Zone}</span>
                            </div>
                            <div class="viewpoint-btm">
                                <span><img src="./img/icons_clock.png" alt="">${appendData[index].Opentime}</span>
                                <span><img src="./img/icons_pin.png" alt="">${appendData[index].Add}</span>
                                <span class="viewpoint-btm-info"><img src="./img/icons_phone.png" alt="">${appendData[index].Tel}</span>
                                <span class="viewpoint-btm-info"><img src="./img/icons_tag.png" alt="">${appendData[index].Ticketinfo}</span>
                            </div>
                        </div> `;
                $(".viewpoint-content").append(templete);
            }
        }


        function initialMap() {
            //設定google map所需的資料
            var currentPostion = {
                lat: 22.7346819,
                lng: 120.2392813
            };
            //HTML要放置地圖的標籤
            var mapTage = $("#map")[0];
            //繪製地圖 .Map(要繪製地圖的HTML標籤,{})
            var map = new google.maps.Map(mapTage, {
                center: currentPostion,
                zoom: 14
            });
            return map;
        }

        function googleMap(appendData, map, markers) {

            for (var index = 0; index < appendData.length; index++) {
                var str = {};
                var place = {};

                place.lat = parseFloat(appendData[index].Py);
                place.lng = parseFloat(appendData[index].Px);

                str.map = map;
                str.title = appendData[index].Name;
                str.position = place;
                map.setCenter(str.position);
                var marker = new google.maps.Marker(str);
                markers.push(marker);
                // console.log(map);
            }

        }

        function clearMarkers(map, markers) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
            }
        }
    };
});