function hideLoading(){
    console.log('hideLoading')
}

$('#btn-listar').on('click', function() {
    var $this = $(this);
  $this.button('loading');
    setTimeout(function() {
       $this.button('reset');
   }, 8000);
});