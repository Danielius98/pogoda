$(document).ready(function() {
    // Добавляем контейнер для списка регионов
    const regionListContainer = `
    <div class="region-list" style="position: absolute; top: 10px; left: 10px; z-index: 1000; background-color: #fff; padding: 10px; border: 1px solid #ccc; border-radius: 5px; max-height: 80vh; overflow-y: auto;">
      <h3 style="margin: 0 0 10px 0;">Регионы</h3>
      <div id="region-items"></div>
    </div>
  `;
    $('body').append(regionListContainer);

    // Стили для списка регионов
    const regionListStyles = `
    <style>
      .region-list {
        font-family: Arial, sans-serif;
      }
      .reg {
        padding: 5px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
      }
      .reg:hover {
        background-color: #f0f0f0;
      }
      .reg span {
        display: none; /* Скрываем ID региона */
      }
    </style>
  `;
    $('head').append(regionListStyles);

    // Инициализация списка регионов из idAarr2
    for (var i = 0; i < idAarr2.length; i++) {
        var regionId = idAarr2[i][0];
        var regionName = idAarr2[i][1];
        $('#region-items').append(`
      <div class="reg">
        <span>${regionId}</span>
        ${regionName}
      </div>
    `);
    }
});