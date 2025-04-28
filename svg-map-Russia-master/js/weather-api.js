$(document).ready(function() {
    // Переменная для хранения текущего выделенного региона (предполагается, что она определена в map-interaction.js)
    // let currentSelectedPath = null;

    // Обработчик клика по региону на карте
    $('path').click(function(e) {
        e.stopPropagation(); // Предотвращаем всплытие события до document

        // Если кликнули на уже выбранный регион, сбрасываем выбор
        if (currentSelectedPath === this) {
            resetSelection();
            return;
        }

        // Сбрасываем стили для всех регионов
        $('path').css('fill', 'rgba(0,0,0,0.2)');

        // Если уже есть выделенный регион, очищаем индикатор
        if (currentSelectedPath && currentSelectedPath !== this) {
            $('.indicator').html('');
            $('.indicator').hide();
        }

        // Сохраняем текущий выбранный регион
        currentSelectedPath = this;

        // Очищаем индикатор перед новым запросом
        $('.indicator').html('');

        var id = $(this).attr('id').toUpperCase();
        var regionName = '';
        var regionCoords = null;

        if ($(this).attr('name')) {
            regionName = $(this).attr('name');
            $('<div>' + regionName + '</div>').appendTo('.indicator');
        }

        for (var j = 0; j < idAarr2.length; j++) {
            if (id == idAarr2[j][0].toUpperCase()) {
                regionCoords = idAarr2[j][3];
                break;
            }
        }

        if (regionCoords) {
            $.ajax({
                url: 'http://api.weatherapi.com/v1/forecast.json',
                data: {
                    key: 'e438dfaf96794ced9c340852252504',
                    q: regionCoords[0] + ',' + regionCoords[1],
                    lang: 'ru',
                    days: 7
                },
                success: function(data) {
                    var currentWeather = data.current.condition.text;
                    var currentTemp = Math.round(data.current.temp_c);
                    var currentWeatherIcon = `https:${data.current.condition.icon}`;

                    $('.indicator').append(`
            <div class="weather-info">
              <strong>Сегодня:</strong>
              <img src="${currentWeatherIcon}" alt="weather icon" style="width: 50px; vertical-align: middle;">
              <span style="margin-left: 10px;">${currentWeather}, ${currentTemp}°C</span>
            </div>
          `);

                    var forecastDays = data.forecast.forecastday;
                    for (var i = 0; i < forecastDays.length; i++) {
                        var day = forecastDays[i];
                        var date = new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
                        var forecastWeather = day.day.condition.text;
                        var forecastTempMax = Math.round(day.day.maxtemp_c);
                        var forecastTempMin = Math.round(day.day.mintemp_c);
                        var forecastIcon = `https:${day.day.condition.icon}`;

                        $('.indicator').append(`
              <div class="weather-info" style="margin-top: 10px;">
                <strong>${date}:</strong>
                <img src="${forecastIcon}" alt="weather icon" style="width: 40px; vertical-align: middle;">
                <span style="margin-left: 10px;">${forecastWeather}, ${forecastTempMin}°C - ${forecastTempMax}°C</span>
              </div>
            `);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    $('.indicator').append(`<div>Не удалось загрузить погоду: ${textStatus} - ${errorThrown}</div>`);
                    console.log('WeatherAPI Error:', textStatus, errorThrown);
                    console.log('Response:', jqXHR.responseText);
                }
            });
        } else {
            $('.indicator').append('<div>Координаты региона не найдены</div>');
        }

        // Выделяем только текущий регион
        $(this).css('fill', '#f6e72d');
        $('.indicator').css({
            'top': e.pageY / scale - translateY,
            'left': (e.pageX / scale + 30) - translateX
        }).show();
    });

    // Обработчик клика по списку регионов
    $('.reg').click(function(e) {
        e.stopPropagation(); // Предотвращаем всплытие события до document

        // Сбрасываем стили для всех регионов
        $('path').css('fill', 'rgba(0,0,0,0.2)');

        // Очищаем индикатор
        $('.indicator').html('');
        $('.indicator').hide();

        var id = $(this).find('span').text();
        var idHover = '#' + id;

        // Если кликнули на уже выбранный регион, сбрасываем выбор
        if (currentSelectedPath === $(idHover)[0]) {
            resetSelection();
            return;
        }

        // Сохраняем текущий выбранный регион
        currentSelectedPath = $(idHover)[0];

        var regionName = '';
        var regionCoords = null;

        for (var j = 0; j < idAarr2.length; j++) {
            if (id == idAarr2[j][0]) {
                regionName = idAarr2[j][1];
                regionCoords = idAarr2[j][3];
                break;
            }
        }

        if (regionName) {
            $('<div>' + regionName + '</div>').appendTo('.indicator');
        }

        if (regionCoords) {
            $.ajax({
                url: 'http://api.weatherapi.com/v1/forecast.json',
                data: {
                    key: 'e438dfaf96794ced9c340852252504',
                    q: regionCoords[0] + ',' + regionCoords[1],
                    lang: 'ru',
                    days: 7
                },
                success: function(data) {
                    var currentWeather = data.current.condition.text;
                    var currentTemp = Math.round(data.current.temp_c);
                    var currentWeatherIcon = `https:${data.current.condition.icon}`;

                    $('.indicator').append(`
            <div class="weather-info">
              <strong>Сегодня:</strong>
              <img src="${currentWeatherIcon}" alt="weather icon" style="width: 50px; vertical-align: middle;">
              <span style="margin-left: 10px;">${currentWeather}, ${currentTemp}°C</span>
            </div>
          `);

                    var forecastDays = data.forecast.forecastday;
                    for (var i = 0; i < forecastDays.length; i++) {
                        var day = forecastDays[i];
                        var date = new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
                        var forecastWeather = day.day.condition.text;
                        var forecastTempMax = Math.round(day.day.maxtemp_c);
                        var forecastTempMin = Math.round(day.day.mintemp_c);
                        var forecastIcon = `https:${day.day.condition.icon}`;

                        $('.indicator').append(`
              <div class="weather-info" style="margin-top: 10px;">
                <strong>${date}:</strong>
                <img src="${forecastIcon}" alt="weather icon" style="width: 40px; vertical-align: middle;">
                <span style="margin-left: 10px;">${forecastWeather}, ${forecastTempMin}°C - ${forecastTempMax}°C</span>
              </div>
            `);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    $('.indicator').append(`<div>Не удалось загрузить погоду: ${textStatus} - ${errorThrown}</div>`);
                    console.log('WeatherAPI Error:', textStatus, errorThrown);
                    console.log('Response:', jqXHR.responseText);
                }
            });
        } else {
            $('.indicator').append('<div>Координаты региона не найдены</div>');
        }

        $(idHover).css('fill', '#f6e72d');
        $('.indicator').css({
            'top': e.pageY / scale - translateY,
            'left': (e.pageX / scale + 30) - translateX
        }).show();
    });
});