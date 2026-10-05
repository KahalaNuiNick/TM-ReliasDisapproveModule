javascript:(function(){
    const event = new KeyboardEvent('keydown', {
        key: 'E',
        code: 'KeyE',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(event);
})();
