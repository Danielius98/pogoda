$(document).ready(function() {
  let isDragging = false;
  let startX, startY;

  $('svg').mousedown(function(e) {
    isDragging = true;
    startX = e.pageX;
    startY = e.pageY;
  });

  $(document).mousemove(function(e) {
    if (isDragging) {
      translateX += (e.pageX - startX) / scale;
      translateY += (e.pageY - startY) / scale;
      startX = e.pageX;
      startY = e.pageY;
      updateTransform();
    }
  });

  $(document).mouseup(function() {
    isDragging = false;
  });

  $('.indicator').click(function(e) {
    e.stopPropagation();
    resetSelection();
  });

  // Переменная для хранения текущего выделенного региона
  let currentSelectedPath = null;

  // Переменные для управления зумом
  let scale = 1;
  const scaleStep = 0.2;
  const minScale = 0.5;
  const maxScale = 3;
  let translateX = 0;
  let translateY = 0;

  // Добавляем кнопки зума
  const zoomControls = `
    <div class="zoom-controls" style="position: absolute; top: 10px; right: 10px; z-index: 1000;">
      <button id="zoom-in">+</button>
      <button id="zoom-out">−</button>
      <button id="zoom-reset">=</button>
    </div>
  `;
  $('body').append(zoomControls);

  // Стили для кнопок
  const zoomStyles = `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
      .zoom-controls button {
        display: block;
        width: 30px;
        height: 30px;
        margin: 5px 0;
        font-size: 16px;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: pointer;
      }
      .zoom-controls button:hover {
        background-color: #f0f0f0;
      }
    </style>
  `;
  $('head').append(zoomStyles);

  // Функция обновления трансформации SVG
  function updateTransform() {
    $('svg').attr('transform', `scale(${scale}) translate(${translateX}, ${translateY})`);
  }

  // Функция сброса выбора региона
  function resetSelection() {
    if (currentSelectedPath) {
      $('path').css('fill', 'rgba(0,0,0,0.2)');
      $('.indicator').html('');
      $('.indicator').hide();
      currentSelectedPath = null;
    }
  }

  // Обработчик кнопки Zoom In
  $('#zoom-in').click(function() {
    if (scale < maxScale) {
      scale += scaleStep;
      updateTransform();
    }
  });

  // Обработчик кнопки Zoom Out
  $('#zoom-out').click(function() {
    if (scale > minScale) {
      scale -= scaleStep;
      updateTransform();
    }
  });

  // Обработчик кнопки Reset Zoom
  $('#zoom-reset').click(function() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  });

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

  // Обработчик клика за пределы карты
  $(document).click(function(e) {
    if (!$(e.target).closest('svg, .reg, .zoom-controls').length) {
      resetSelection();
    }
  });

  // Инициализация списка регионов
  $('path').each(function() {
    var regId = $(this).attr('id');
    var name = '';
    for (var j = 0; j < idAarr2.length; j++) {
      if (regId == idAarr2[j][0]) {
        name = idAarr2[j][1];
        $(this).attr('name', name);
      }
    }

    var regIdDiv = '<div class="reg" >' + '[' + '<span>' + regId + '</span>' + ']' + ' ' + name + '</div>';
    $(regIdDiv).appendTo('.regs');
  });
});


var idAarr = ["RU-MOW", "RU-SPE", "RU-NEN", "RU-YAR", "RU-CHE", "RU-ULY", "RU-TYU", "RU-TUL", "RU-SVE", "RU-RYA", "RU-ORL", "RU-OMS", "RU-NGR", "RU-LIP", "RU-KRS", "RU-KGN", "RU-KGD", "RU-IVA", "RU-BRY", "RU-AST", "RU-KHA", "RU-CE", "RU-UD", "RU-SE", "RU-MO", "RU-KR", "RU-KL", "RU-IN", "RU-AL", "RU-BA", "RU-AD", "RU-CR", "RU-SEV", "RU-KO", "RU-KIR", "RU-PNZ", "RU-TAM", "RU-MUR", "RU-LEN", "RU-VLG", "RU-KOS", "RU-PSK", "RU-ARK", "RU-YAN", "RU-CHU", "RU-YEV", "RU-TY", "RU-SAK", "RU-AMU", "RU-BU", "RU-KK", "RU-KEM", "RU-NVS", "RU-ALT", "RU-DA", "RU-STA", "RU-KB", "RU-KC", "RU-KDA", "RU-ROS", "RU-SAM", "RU-TA", "RU-ME", "RU-CU", "RU-NIZ", "RU-VLA", "RU-MOS", "RU-KLU", "RU-BEL", "RU-ZAB", "RU-PRI", "RU-KAM", "RU-MAG", "RU-SA", "RU-KYA", "RU-ORE", "RU-SAR", "RU-VGG", "RU-VOR", "RU-SMO", "RU-TVE", "RU-PER", "RU-KHM", "RU-TOM", "RU-IRK"];

var idAarr2 = new Array(
    ["RU-MOW", "Москва", "", [55.7558, 37.6173]],
    ["RU-CHE", "Челябинская область", "", [55.1644, 61.4368]],
    ["RU-ORL", "Орловская область", "", [52.9690, 36.0640]],
    ["RU-OMS", "Омская область", "", [54.9893, 73.3682]],
    ["RU-LIP", "Липецкая область", "", [52.6122, 39.5980]],
    ["RU-KRS", "Курская область", "", [51.7300, 36.1930]],
    ["RU-RYA", "Рязанская область", "", [54.6292, 39.7360]],
    ["RU-BRY", "Брянская область", "", [53.2436, 34.3637]],
    ["RU-KIR", "Кировская область", "", [58.6035, 49.6680]],
    ["RU-ARK", "Архангельская область", "", [64.5400, 40.5430]],
    ["RU-MUR", "Мурманская область", "", [68.9707, 33.0827]],
    ["RU-SPE", "Санкт-Петербург", "", [59.9343, 30.3351]],
    ["RU-YAR", "Ярославская область", "", [57.6261, 39.8845]],
    ["RU-ULY", "Ульяновская область", "", [54.3184, 48.3866]],
    ["RU-NVS", "Новосибирская область", "", [55.0084, 82.9357]],
    ["RU-TYU", "Тюменская область", "", [57.1522, 65.5272]],
    ["RU-SVE", "Свердловская область", "", [56.8389, 60.6057]],
    ["RU-NGR", "Новгородская область", "", [58.5215, 31.2755]],
    ["RU-KGN", "Курганская область", "", [55.4410, 65.3411]],
    ["RU-KGD", "Калининградская область", "", [54.7104, 20.4522]],
    ["RU-IVA", "Ивановская область", "", [56.9970, 40.9714]],
    ["RU-AST", "Астраханская область", "", [46.3497, 48.0408]],
    ["RU-KHA", "Хабаровский край", "", [48.4802, 135.0838]],
    ["RU-CE", "Чеченская республика", "", [43.3178, 45.6949]],
    ["RU-UD", "Удмуртская республика", "", [56.8498, 53.2048]],
    ["RU-SE", "Республика Северная Осетия", "", [43.0367, 44.6678]],
    ["RU-MO", "Республика Мордовия", "", [54.1838, 45.1830]],
    ["RU-KR", "Республика Карелия", "", [61.7849, 34.3469]],
    ["RU-KL", "Республика Калмыкия", "", [46.3077, 44.2558]],
    ["RU-IN", "Республика Ингушетия", "", [43.1667, 44.8167]],
    ["RU-AL", "Республика Алтай", "", [51.9581, 85.9603]],
    ["RU-BA", "Республика Башкортостан", "", [54.7351, 55.9678]],
    ["RU-AD", "Республика Адыгея", "", [44.6098, 40.1058]],
    ["RU-CR", "Республика Крым", "", [44.9521, 34.1024]],
    ["RU-SEV", "Севастополь", "", [44.6167, 33.5254]],
    ["RU-KO", "Республика Коми", "", [61.6764, 50.8365]],
    ["RU-PNZ", "Пензенская область", "", [53.2007, 45.0000]],
    ["RU-TAM", "Тамбовская область", "", [52.7236, 41.4539]],
    ["RU-LEN", "Ленинградская область", "", [59.9061, 31.0790]],
    ["RU-VLG", "Вологодская область", "", [59.2239, 39.8840]],
    ["RU-KOS", "Костромская область", "", [57.7670, 40.9269]],
    ["RU-PSK", "Псковская область", "", [57.8167, 28.3333]],
    ["RU-YAN", "Ямало-Ненецкий АО", "", [66.5299, 66.6019]],
    ["RU-CHU", "Чукотский АО", "", [64.7333, -177.5000]],
    ["RU-YEV", "Еврейская автономная область", "", [48.7928, 131.1585]],
    ["RU-TY", "Республика Тыва", "", [51.7191, 94.4378]],
    ["RU-SAK", "Сахалинская область", "", [46.9591, 142.7380]],
    ["RU-AMU", "Амурская область", "", [50.2796, 127.5404]],
    ["RU-BU", "Республика Бурятия", "", [51.8345, 107.5842]],
    ["RU-KK", "Республика Хакасия", "", [53.7125, 91.4292]],
    ["RU-KEM", "Кемеровская область", "", [55.3547, 86.0890]],
    ["RU-ALT", "Алтайский край", "", [53.3606, 83.7636]],
    ["RU-DA", "Республика Дагестан", "", [42.9830, 47.5023]],
    ["RU-KB", "Кабардино-Балкарская республика", "", [43.4833, 43.6167]],
    ["RU-KC", "Карачаево-Черкесская республика", "", [44.2233, 41.7267]],
    ["RU-KDA", "Краснодарский край", "", [45.0355, 38.9753]],
    ["RU-ROS", "Ростовская область", "", [47.2225, 39.7180]],
    ["RU-SAM", "Самарская область", "", [53.2001, 50.1500]],
    ["RU-TA", "Республика Татарстан", "", [55.7963, 49.1064]],
    ["RU-ME", "Республика Марий Эл", "", [56.6388, 47.8908]],
    ["RU-CU", "Чувашская республика", "", [56.1322, 47.2519]],
    ["RU-NIZ", "Нижегородская область", "", [56.3268, 44.0065]],
    ["RU-VLA", "Владимировская область", "", [56.1365, 40.4010]],
    ["RU-MOS", "Московская область", "", [55.7558, 37.6173]],
    ["RU-KLU", "Калужская область", "", [54.5293, 36.2754]],
    ["RU-BEL", "Белгородская область", "", [50.5997, 36.5983]],
    ["RU-ZAB", "Забайкальский край", "", [52.0336, 113.5009]],
    ["RU-PRI", "Приморский край", "", [43.1198, 131.8869]],
    ["RU-KAM", "Камчатский край", "", [53.0167, 158.6500]],
    ["RU-MAG", "Магаданская область", "", [59.5638, 150.8035]],
    ["RU-SA", "Республика Саха", "", [66.7613, 124.1238]],
    ["RU-KYA", "Красноярский край", "", [56.0153, 92.8932]],
    ["RU-ORE", "Оренбургская область", "", [51.7667, 55.1000]],
    ["RU-SAR", "Саратовская область", "", [51.5331, 46.0342]],
    ["RU-VGG", "Волгоградская область", "", [48.7071, 44.5169]],
    ["RU-VOR", "Ставропольский край", "", [45.0428, 41.9734]],
    ["RU-SMO", "Смоленская область", "", [54.7818, 32.0401]],
    ["RU-TVE", "Тверская область", "", [56.8587, 35.9006]],
    ["RU-PER", "Пермская область", "", [58.0105, 56.2502]],
    ["RU-KHM", "Ханты-Мансийский АО", "", [61.0042, 69.0019]],
    ["RU-TOM", "Томская область", "", [56.4977, 84.9744]],
    ["RU-IRK", "Иркутская область", "", [52.2871, 104.2810]],
    ["RU-NEN", "Ненецкий АО", "", [67.6078, 53.0870]],
    ["RU-STA", "Ставропольский край", "", [45.0428, 41.9734]],
    ["RU-TUL", "Тульская область", "", [54.1961, 37.6182]]
);