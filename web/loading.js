function hideLoading(){
    var button = $('#btn-listar');
    button.attr('aria-pressed', "false");
    button.removeAttr('disabled');
    button.removeClass('disabled');
    button.html('Listar')
}

$('#btn-listar').on('click', function() {
    const $this = $(this);
    $this.button('loading');
});