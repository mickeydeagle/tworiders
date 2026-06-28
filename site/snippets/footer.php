  </div>

  <footer class="footer">
    &copy; 2004&ndash;<?= date('Y') ?> <a href="/about">Mickey Deagle</a>. All rights reserved.
  </footer>

  <script src="//code.jquery.com/jquery-latest.js"></script>
  <?= js('assets/js/simple-lightbox.js') ?>
  
  <script>
    $(function(){
		var $gallery = $('figure a').simpleLightbox({captionsData: 'alt', captionPosition: 'outside', nav: false, close: false});
    });
  </script>
  
</body>
</html>
