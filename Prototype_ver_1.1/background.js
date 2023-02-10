/* 
 * Школа №2072 Предпрофессиональная олимпиада "ИТ профиль"
 */


chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'outerBounds': {
            'width': 1200,
            'height': 800
        }
    }, function(window) {});
});

