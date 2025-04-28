$(document).ready(function() {
    let isDragging = false;
    let startX, startY;

    // Переменные для управления зумом и перемещением
    let scale = 1;
    const scaleStep = 0.2;
    const minScale = 0.5;
    const maxScale = 3;
    let translateX = 0;
    let translateY = 0;

    // Переменная для хранения текущего выделенного региона
    let currentSelectedPath = null;

    // Обработчик перетаскивания карты
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

    // Обработчик клика за пределы карты
    $(document).click(function(e) {
        if (!$(e.target).closest('svg, .reg, .zoom-controls').length) {
            resetSelection();
        }
    });

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

    // Обработчик клика по индикатору
    $('.indicator').click(function(e) {
        e.stopPropagation();
        resetSelection();
    });

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
});